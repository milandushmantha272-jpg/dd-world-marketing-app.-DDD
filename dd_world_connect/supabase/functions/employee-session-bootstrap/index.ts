import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const phone = value.trim().replace(/[\s()\-]/g, "");
  if (/^0[0-9]{9}$/.test(phone)) return `+94${phone.slice(1)}`;
  if (/^\+[1-9][0-9]{7,14}$/.test(phone)) return phone;
  return null;
}

function resolveRole(roleValue: unknown, teamId: unknown): string {
  const role = String(roleValue ?? "").trim().toLowerCase();
  if (role === "owner") return "owner";
  if (role === "team_leader") return "team_leader";
  if (role === "direct_agent") return "direct_agent";
  if (role === "agent") return teamId == null ? "direct_agent" : "agent";
  return "unassigned";
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond(405, { code: "METHOD_NOT_ALLOWED", error: "Method not allowed." });

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return respond(401, { code: "AUTH_REQUIRED", error: "Sign in with phone OTP first." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return respond(500, { code: "SERVER_CONFIG", error: "Authentication service is not configured." });
  }

  const token = authorization.slice("Bearer ".length);
  const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData.user;
  if (userError || !user || !user.phone) {
    return respond(401, { code: "AUTH_REQUIRED", error: "A verified phone session is required." });
  }

  let payload: { installation_id?: unknown; platform?: unknown };
  try {
    payload = await request.json();
  } catch {
    return respond(400, { code: "INVALID_BODY", error: "Invalid request body." });
  }
  const installationId = typeof payload.installation_id === "string" ? payload.installation_id.trim() : "";
  const platform = typeof payload.platform === "string" ? payload.platform : "";
  if (installationId.length < 16 || installationId.length > 128 ||
      !["android", "ios", "other"].includes(platform)) {
    return respond(400, { code: "INVALID_DEVICE", error: "Invalid device registration data." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Match against the verified Auth phone, never a phone number supplied by the app.
  // The existing employee dataset contains a duplicate normalized phone. Reject
  // ambiguous matches until the Owner corrects the source records.
  const { data: matches, error: employeeError } = await admin
    .from("employees")
    .select("id, source_user_id, auth_user_id, employee_code, full_name, phone_e164, status, approved")
    .eq("phone_e164", normalizePhone(user.phone))
    .limit(2);

  if (employeeError) {
    console.error("Employee lookup failed", employeeError.message);
    return respond(500, { code: "PROFILE_LOOKUP_FAILED", error: "Could not verify employee access." });
  }
  if (!matches || matches.length === 0) {
    return respond(403, { code: "EMPLOYEE_NOT_FOUND", error: "This number is not linked to a DD WORLD employee." });
  }
  if (matches.length > 1) {
    return respond(403, {
      code: "PHONE_NOT_UNIQUE",
      error: "This mobile number is assigned to more than one employee record. Contact the Owner to correct the records before signing in.",
    });
  }
  const employee = matches[0];

  // Read the canonical existing users row on every bootstrap. The mirror table is
  // useful for indexed phone matching, but never replaces the source authorization check.
  const { data: sourceUser, error: sourceError } = await admin
    .from("users")
    .select("id, auth_user_id, name, agent_code, phone, role, status, employment_status, id_approval_status, team_id")
    .eq("id", employee.source_user_id)
    .maybeSingle();

  if (sourceError || !sourceUser) {
    console.error("Canonical employee lookup failed", sourceError?.message);
    return respond(500, { code: "PROFILE_LOOKUP_FAILED", error: "Could not verify employee access." });
  }

  const verifiedPhone = normalizePhone(user.phone);
  const sourcePhone = normalizePhone(sourceUser.phone);
  const isApproved = String(sourceUser.status ?? "").toLowerCase() === "active" &&
    String(sourceUser.employment_status ?? "").toUpperCase() === "ACTIVE" &&
    String(sourceUser.id_approval_status ?? "").toUpperCase() === "APPROVED";

  if (!verifiedPhone || sourcePhone !== verifiedPhone) {
    return respond(403, { code: "PHONE_NOT_UNIQUE", error: "The registered employee phone needs Owner review before sign-in." });
  }
  if (!isApproved || employee.status !== "active" || employee.approved !== true) {
    return respond(403, { code: "EMPLOYEE_NOT_APPROVED", error: "Employee access is not active and approved. Contact the Owner." });
  }
  if ((sourceUser.auth_user_id && sourceUser.auth_user_id !== user.id) ||
      (employee.auth_user_id && employee.auth_user_id !== user.id)) {
    return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "This employee is linked to another authentication identity. Contact the Owner." });
  }

  if (!sourceUser.auth_user_id) {
    const { data: linked, error: linkError } = await admin
      .from("users")
      .update({ auth_user_id: user.id })
      .eq("id", employee.source_user_id)
      .is("auth_user_id", null)
      .eq("status", "active")
      .eq("employment_status", "ACTIVE")
      .eq("id_approval_status", "APPROVED")
      .select("id, auth_user_id")
      .maybeSingle();

    if (linkError) {
      console.error("Auth identity linking failed", linkError.message);
      return respond(500, { code: "PROFILE_LINK_FAILED", error: "Could not link employee authentication." });
    }
    if (!linked) {
      const { data: latest } = await admin
        .from("users")
        .select("auth_user_id,status,employment_status,id_approval_status")
        .eq("id", employee.source_user_id)
        .maybeSingle();
      const latestApproved = latest?.status === "active" &&
        latest?.employment_status === "ACTIVE" &&
        latest?.id_approval_status === "APPROVED";
      if (latest?.auth_user_id !== user.id || !latestApproved) {
        return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "Employee authentication could not be linked safely." });
      }
    }
  }

  const role = resolveRole(sourceUser.role, sourceUser.team_id);
  if (!["owner", "team_leader", "agent", "direct_agent"].includes(role)) {
    return respond(403, { code: "ROLE_NOT_CONFIGURED", error: "Employee role is missing or invalid. Contact the Owner." });
  }

  const deviceHash = await sha256(`${employee.id}:${installationId}`);
  const { data: activeDevice, error: deviceLookupError } = await admin
    .from("device_registrations")
    .select("id, device_id_hash, platform")
    .eq("employee_id", employee.id)
    .eq("status", "active")
    .maybeSingle();

  if (deviceLookupError) {
    console.error("Device lookup failed", deviceLookupError.message);
    return respond(500, { code: "DEVICE_LOOKUP_FAILED", error: "Could not verify registered device." });
  }

  let deviceId: string;
  if (activeDevice) {
    if (activeDevice.device_id_hash !== deviceHash) {
      return respond(403, {
        code: "DEVICE_ALREADY_REGISTERED",
        error: "This employee is registered on another device. Ask the Owner to reset device registration.",
      });
    }
    deviceId = activeDevice.id;
    const { error: seenError } = await admin
      .from("device_registrations")
      .update({ platform, last_seen_at: new Date().toISOString() })
      .eq("id", deviceId)
      .eq("status", "active");
    if (seenError) {
      console.error("Device last-seen update failed", seenError.message);
      return respond(500, { code: "DEVICE_UPDATE_FAILED", error: "Could not refresh registered device." });
    }
  } else {
    const { data: created, error: createDeviceError } = await admin
      .from("device_registrations")
      .insert({
        employee_id: employee.id,
        device_id_hash: deviceHash,
        platform,
        status: "active",
        registered_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createDeviceError || !created) {
      // Another concurrent login may have won the partial unique-index race.
      const { data: racedDevice } = await admin
        .from("device_registrations")
        .select("id, device_id_hash")
        .eq("employee_id", employee.id)
        .eq("status", "active")
        .maybeSingle();
      if (!racedDevice) {
        return respond(403, {
          code: "DEVICE_REGISTRATION_REJECTED",
          error: "This installation was previously revoked or could not be registered. Contact the Owner for assistance.",
        });
      }
      if (racedDevice.device_id_hash !== deviceHash) {
        return respond(403, {
          code: "DEVICE_ALREADY_REGISTERED",
          error: "Another device is already registered. Ask the Owner to reset device registration.",
        });
      }
      deviceId = racedDevice.id;
    } else {
      deviceId = created.id;
    }
  }

  return respond(200, {
    employee_id: employee.id,
    employee_code: employee.employee_code,
    full_name: employee.full_name,
    phone_e164: verifiedPhone,
    role,
    device_registration_id: deviceId,
  });
});
