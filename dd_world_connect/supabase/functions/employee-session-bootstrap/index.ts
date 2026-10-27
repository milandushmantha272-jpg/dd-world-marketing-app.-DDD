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

  // The phone is taken from the verified Supabase Auth user, never from the request body.
  const { data: employee, error: employeeError } = await admin
    .from("employees")
    .select("id, auth_user_id, employee_code, full_name, phone_e164, status, approved")
    .eq("phone_e164", user.phone)
    .maybeSingle();

  if (employeeError) {
    console.error("Employee lookup failed", employeeError.message);
    return respond(500, { code: "PROFILE_LOOKUP_FAILED", error: "Could not verify employee access." });
  }
  if (!employee) {
    return respond(403, { code: "EMPLOYEE_NOT_FOUND", error: "This number is not linked to a DD WORLD employee." });
  }
  if (employee.status !== "active" || employee.approved !== true) {
    return respond(403, { code: "EMPLOYEE_NOT_APPROVED", error: "Employee access is not active and approved. Contact the Owner." });
  }
  if (employee.auth_user_id && employee.auth_user_id !== user.id) {
    return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "This employee is linked to another authentication identity. Contact the Owner." });
  }

  if (!employee.auth_user_id) {
    const { data: linked, error: linkError } = await admin
      .from("employees")
      .update({ auth_user_id: user.id, updated_at: new Date().toISOString() })
      .eq("id", employee.id)
      .is("auth_user_id", null)
      .eq("status", "active")
      .eq("approved", true)
      .select("id, auth_user_id")
      .maybeSingle();

    if (linkError) {
      console.error("Auth identity linking failed", linkError.message);
      return respond(500, { code: "PROFILE_LINK_FAILED", error: "Could not link employee authentication." });
    }
    if (!linked) {
      const { data: latest } = await admin.from("employees").select("auth_user_id,status,approved").eq("id", employee.id).maybeSingle();
      if (latest?.auth_user_id !== user.id || latest.status !== "active" || latest.approved !== true) {
        return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "Employee authentication could not be linked safely." });
      }
    }
  }

  const { data: roles, error: roleError } = await admin
    .from("role_assignments")
    .select("role")
    .eq("employee_id", employee.id)
    .is("valid_until", null);

  if (roleError) {
    console.error("Role lookup failed", roleError.message);
    return respond(500, { code: "ROLE_LOOKUP_FAILED", error: "Could not verify employee permissions." });
  }
  if (!roles || roles.length !== 1 || !["owner", "team_leader", "agent", "direct_agent"].includes(roles[0].role)) {
    return respond(403, { code: "ROLE_NOT_CONFIGURED", error: "Employee role is missing or ambiguous. Contact the Owner." });
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
    if (activeDevice.platform !== platform) {
      await admin.from("device_registrations").update({ platform, last_seen_at: new Date().toISOString() }).eq("id", deviceId);
    } else {
      await admin.from("device_registrations").update({ last_seen_at: new Date().toISOString() }).eq("id", deviceId);
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
      if (!racedDevice || racedDevice.device_id_hash !== deviceHash) {
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
    phone_e164: employee.phone_e164,
    role: roles[0].role,
    device_registration_id: deviceId,
  });
});
