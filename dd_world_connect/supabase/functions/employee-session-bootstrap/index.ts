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
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
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
  if (!authorization?.startsWith("Bearer ")) return respond(401, { code: "AUTH_REQUIRED", error: "Sign in with phone OTP first." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return respond(500, { code: "SERVER_CONFIG", error: "Authentication service is not configured." });
  }

  const token = authorization.slice("Bearer ".length);
  const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const authUser = userData.user;
  if (userError || !authUser?.phone) return respond(401, { code: "AUTH_REQUIRED", error: "A verified phone session is required." });

  let payload: { installation_id?: unknown; platform?: unknown };
  try {
    payload = await request.json();
  } catch {
    return respond(400, { code: "INVALID_BODY", error: "Invalid request body." });
  }
  const installationId = typeof payload.installation_id === "string" ? payload.installation_id.trim() : "";
  const platform = typeof payload.platform === "string" ? payload.platform : "";
  if (installationId.length < 16 || installationId.length > 128 || !["android", "ios", "other"].includes(platform)) {
    return respond(400, { code: "INVALID_DEVICE", error: "Invalid device registration data." });
  }

  const verifiedPhone = normalizePhone(authUser.phone);
  if (!verifiedPhone) return respond(403, { code: "INVALID_PHONE", error: "The verified phone number is not valid. Contact the Owner." });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // The live employee master is public.users. Do not depend on a parallel employees table.
  const { data: sourceRows, error: employeeError } = await admin
    .from("users")
    .select("id,auth_user_id,name,agent_code,phone,role,status,employment_status,id_approval_status,team_id")
    .limit(500);
  if (employeeError || !sourceRows) {
    console.error("Employee lookup failed", employeeError?.message);
    return respond(500, { code: "PROFILE_LOOKUP_FAILED", error: "Could not verify employee access." });
  }

  const matches = sourceRows.filter((row) => normalizePhone(row.phone) === verifiedPhone);
  if (matches.length === 0) return respond(403, { code: "EMPLOYEE_NOT_FOUND", error: "This number is not linked to a DD WORLD employee." });
  if (matches.length > 1) {
    return respond(403, { code: "PHONE_NOT_UNIQUE", error: "This mobile number is assigned to more than one employee record. Contact the Owner." });
  }

  const employee = matches[0];
  const isApproved = String(employee.status ?? "").toLowerCase() === "active" &&
    String(employee.employment_status ?? "").toUpperCase() === "ACTIVE" &&
    String(employee.id_approval_status ?? "").toUpperCase() === "APPROVED";
  if (!isApproved) return respond(403, { code: "EMPLOYEE_NOT_APPROVED", error: "Employee access is not active and approved. Contact the Owner." });

  if (employee.auth_user_id && employee.auth_user_id !== authUser.id) {
    return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "This employee is linked to another authentication identity. Contact the Owner." });
  }
  if (!employee.auth_user_id) {
    const { data: linked, error: linkError } = await admin.from("users")
      .update({ auth_user_id: authUser.id })
      .eq("id", employee.id)
      .is("auth_user_id", null)
      .eq("status", "active")
      .eq("employment_status", "ACTIVE")
      .eq("id_approval_status", "APPROVED")
      .select("id,auth_user_id")
      .maybeSingle();
    if (linkError) {
      console.error("Auth identity linking failed", linkError.message);
      return respond(500, { code: "PROFILE_LINK_FAILED", error: "Could not link employee authentication." });
    }
    if (!linked) {
      const { data: latest } = await admin.from("users").select("auth_user_id,status,employment_status,id_approval_status").eq("id", employee.id).maybeSingle();
      if (latest?.auth_user_id !== authUser.id || latest?.status !== "active" ||
          latest?.employment_status !== "ACTIVE" || latest?.id_approval_status !== "APPROVED") {
        return respond(403, { code: "EMPLOYEE_AUTH_LINK_CONFLICT", error: "Employee authentication could not be linked safely." });
      }
    }
  }

  const role = resolveRole(employee.role, employee.team_id);
  if (!["owner", "team_leader", "agent", "direct_agent"].includes(role)) {
    return respond(403, { code: "ROLE_NOT_CONFIGURED", error: "Employee role is missing or invalid. Contact the Owner." });
  }

  // user_devices is the existing device/FCM registry. A temporary non-FCM token
  // reserves the installation until Firebase supplies its real token after login.
  const deviceHash = await sha256(`${employee.id}:${installationId}`);
  const deviceLabel = `ddwc-install:${deviceHash}`;
  const pendingToken = `pending:${employee.id}`;
  const { data: activeDevices, error: deviceLookupError } = await admin
    .from("user_devices")
    .select("id,device_label,platform")
    .eq("employee_id", employee.id)
    .eq("is_active", true);
  if (deviceLookupError) {
    console.error("Device lookup failed", deviceLookupError.message);
    return respond(500, { code: "DEVICE_LOOKUP_FAILED", error: "Could not verify registered device." });
  }

  let deviceId: string;
  const sameInstallation = (activeDevices ?? []).find((device) => device.device_label === deviceLabel);
  if (sameInstallation) {
    deviceId = sameInstallation.id;
    const { error: seenError } = await admin.from("user_devices")
      .update({ platform, last_seen_at: new Date().toISOString() })
      .eq("id", deviceId).eq("is_active", true);
    if (seenError) return respond(500, { code: "DEVICE_UPDATE_FAILED", error: "Could not refresh registered device." });
  } else {
    if ((activeDevices ?? []).length > 0) {
      return respond(403, { code: "DEVICE_ALREADY_REGISTERED", error: "This employee is registered on another device. Ask the Owner to reset device registration." });
    }
    const { data: created, error: createError } = await admin.from("user_devices")
      .insert({
        employee_id: employee.id,
        fcm_token: pendingToken,
        platform,
        device_label: deviceLabel,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      })
      .select("id").single();
    if (createError || !created) {
      const { data: racedDevices } = await admin.from("user_devices")
        .select("id,device_label").eq("employee_id", employee.id).eq("is_active", true);
      const raced = (racedDevices ?? []).find((device) => device.device_label === deviceLabel);
      if (!raced) {
        return respond(403, { code: "DEVICE_REGISTRATION_REJECTED", error: "This installation could not be registered. Contact the Owner for assistance." });
      }
      deviceId = raced.id;
    } else {
      deviceId = created.id;
    }
  }

  return respond(200, {
    employee_id: employee.id,
    employee_code: employee.agent_code ?? "",
    full_name: employee.name ?? "",
    phone_e164: verifiedPhone,
    role,
    device_registration_id: deviceId,
  });
});
