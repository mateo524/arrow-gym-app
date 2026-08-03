import webpush from "npm:web-push@3.6.6";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";

webpush.setVapidDetails(
  "mailto:admin@loop-gym.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { subscription, title, body, tag, delaySeconds = 0 } = await req.json();

    const send = async () => {
      const sub = typeof subscription === "string"
        ? JSON.parse(subscription)
        : subscription;
      await webpush.sendNotification(sub, JSON.stringify({ title, body, tag }));
    };

    if (delaySeconds > 0 && delaySeconds <= 600) {
      // Para rest timers de hasta 10 minutos
      setTimeout(send, delaySeconds * 1000);
      return new Response(JSON.stringify({ scheduled: true, delaySeconds }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      await send();
      return new Response(JSON.stringify({ sent: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (err) {
    console.error("Push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
