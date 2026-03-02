import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { spyReportEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { analysis, competitorName } = await request.json();
  if (!analysis) return Response.json({ error: "analysis required" }, { status: 400 });

  const { subject, html } = spyReportEmail({ analysis, competitorName: competitorName || "Competitor" });

  await resend.emails.send({
    from: "Nesco Digital AI <noreply@nescodigital.com>",
    to: user.email!,
    subject,
    html,
  });

  return Response.json({ ok: true });
}
