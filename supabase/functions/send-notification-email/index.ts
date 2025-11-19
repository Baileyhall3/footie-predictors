import { serve } from "https://deno.land/std/http/server.ts";
import { Resend } from "npm:resend@3";

serve(async (_req) => {
  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // 1. Atomically claim pending notifications
    const claimRes = await fetch(
      `${SUPABASE_URL}/rest/v1/notifications?email_sent=eq.false&email_processing=eq.false&select=*`,
      {
        method: "PATCH",
        headers: {
          apiKey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "return=representation" // Returns the updated rows
        },
        body: JSON.stringify({ email_processing: true })
      }
    );

    const pending = await claimRes.json();

    if (!Array.isArray(pending) || pending.length === 0) {
      return new Response("No pending notifications", { status: 200 });
    }

    console.log(`Processing ${pending.length} notifications`);

    for (const record of pending) {
      const baseUrl = "https://www.footiepredictors.com";
      const href = record.link?.startsWith("http")
        ? record.link
        : `${baseUrl}${record.link ?? ""}`;

      const linkText = record.template_data?.link_text ?? "View";
      const linkHtml = record.link
        ? `<p><a href="${href}" style="color:#2563eb;text-decoration:underline;">${linkText} →</a></p>`
        : "";

      const html = `
        <div style="font-family:sans-serif; line-height:1.5;">
          <h2>${record.template_data?.header ?? "Notification"}</h2>
          <p>${record.template_data?.content ?? ""}</p>
          ${linkHtml}
        </div>
      `;

      try {
        await resend.emails.send({
          from: "Footie Predictors <no-reply@notifications.footiepredictors.com>",
          to: record.user_email,
          subject: record.template_data?.header ?? "Notification",
          html,
        });

        // Mark as sent and clear processing flag
        await fetch(
          `${SUPABASE_URL}/rest/v1/notifications?id=eq.${record.id}`,
          {
            method: "PATCH",
            headers: {
              apiKey: SERVICE_ROLE,
              Authorization: `Bearer ${SERVICE_ROLE}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email_sent: true,
              email_processing: false
            })
          }
        );

        // Wait 500ms for Resend rate limit (2 emails/sec)
        await new Promise((r) => setTimeout(r, 500));
        console.log("Sent email to:", record.user_email);
      } catch (err) {
        console.error("Email send failed for", record.id, err);
        // Clear processing so it can retry later
        await fetch(
          `${SUPABASE_URL}/rest/v1/notifications?id=eq.${record.id}`,
          {
            method: "PATCH",
            headers: {
              apiKey: SERVICE_ROLE,
              Authorization: `Bearer ${SERVICE_ROLE}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email_processing: false })
          }
        );
      }
    }

    return new Response(`Processed ${pending.length} notifications`, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal error", { status: 500 });
  }
});