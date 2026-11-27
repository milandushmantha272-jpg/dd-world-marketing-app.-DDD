import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Firebase Cloud Messaging was intentionally retired for DD WORLD CONNECT.
// Notifications are persisted in Supabase and delivered to connected clients
// through Supabase Realtime. This endpoint remains as a clear compatibility
// response for any stale caller; it does not contact Firebase or send push.
Deno.serve((request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  return new Response(
    JSON.stringify({
      error: "Push delivery is disabled. Use the Supabase Realtime notification inbox.",
      code: "PUSH_TRANSPORT_RETIRED",
    }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});
