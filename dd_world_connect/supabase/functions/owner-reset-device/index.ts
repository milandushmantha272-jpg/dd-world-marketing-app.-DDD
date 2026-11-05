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

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond(405, { code: "METHOD_NOT_ALLOWED", error: "Method not allowed." });

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(401, { code: "AUTH_REQUIRED", error: "Sign in first." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return respond(500, { code: "SERVER_CONFIG", error: "Device administration is not configured." });
  }

  const token = authorization.slice("Bearer ".length);
  const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return respond(401, { code: "AUTH_REQUIRED", error: "Valid authentication is required." });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: actor, error: actorError } = await admin
    .from("employees")
    .select("id, source_user_id, auth_user_id, status, approved")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (actorError || !actor || actor.auth_user_id !== user.id ||
      actor.status !== "active" || actor.approved !== true) {
    return respond(403, { code: "OWNER_REQUIRED", error: "Only an active, approved Owner can reset device registrations." });
  }

  // Re-check authority against the canonical source row, not a client claim or role in metadata.
  const { data: actorSource, error: actorSourceError } = await admin
    .from("users")
    .select("auth_user_id,role,status,employment_status,id_approval_status")
    .eq("id", actor.source_user_id)
    .maybeSingle();
  if (actorSourceError || !actorSource || actorSource.auth_user_id !== user.id ||
      String(actorSource.role ?? "").toLowerCase() !== "owner" ||
      String(actorSource.status ?? "").toLowerCase() !== "active" ||
      String(actorSource.employment_status ?? "").toUpperCase() !== "ACTIVE" ||
      String(actorSource.id_approval_status ?? "").toUpperCase() !== "APPROVED") {
    return respond(403, { code: "OWNER_REQUIRED", error: "Only an active Owner can reset device registrations." });
  }

  let payload: { employee_code?: unknown };
  try {
    payload = await request.json();
  } catch {
    return respond(400, { code: "INVALID_BODY", error: "Invalid request body." });
  }
  const employeeCode = typeof payload.employee_code === "string" ? payload.employee_code.trim() : "";
  if (!employeeCode || employeeCode.length > 80) {
    return respond(400, { code: "INVALID_EMPLOYEE_CODE", error: "Enter a valid employee code." });
  }

  const { data: target, error: targetError } = await admin
    .from("employees")
    .select("id,employee_code")
    .eq("employee_code", employeeCode)
    .maybeSingle();
  if (targetError) {
    console.error("Target employee lookup failed", targetError.message);
    return respond(500, { code: "EMPLOYEE_LOOKUP_FAILED", error: "Could not find the employee." });
  }
  if (!target) return respond(404, { code: "EMPLOYEE_NOT_FOUND", error: "Employee code was not found." });
  if (target.id === actor.id) {
    return respond(400, { code: "SELF_RESET_NOT_ALLOWED", error: "Use the Owner support process to reset your own device." });
  }

  const now = new Date().toISOString();
  const { data: revoked, error: revokeError } = await admin
    .from("device_registrations")
    .update({ status: "revoked", revoked_at: now })
    .eq("employee_id", target.id)
    .eq("status", "active")
    .select("id");

  if (revokeError) {
    console.error("Device revocation failed", revokeError.message);
    return respond(500, { code: "DEVICE_RESET_FAILED", error: "Could not reset the employee device." });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    actor_employee_id: actor.id,
    action: "employee_device_registration_reset",
    entity_table: "device_registrations",
    entity_id: target.id,
    reason: "Owner initiated device registration reset",
    metadata: {
      target_employee_code: target.employee_code,
      revoked_registration_count: revoked?.length ?? 0,
    },
  });
  if (auditError) {
    console.error("Device reset audit failed", auditError.message);
    return respond(500, { code: "AUDIT_WRITE_FAILED", error: "Device was revoked but audit confirmation failed. Contact system support." });
  }

  return respond(200, {
    success: true,
    employee_code: target.employee_code,
    revoked_registration_count: revoked?.length ?? 0,
  });
});
