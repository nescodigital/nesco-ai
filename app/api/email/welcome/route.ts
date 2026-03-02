import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { welcomeEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Nesco Digital AI <noreply@nescodigital.com>";

// Called from dashboard layout on first load.
// Sends welcome email only once (checked via email_sequence_log).
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if welcome email already sent
    const { data: existing } = await supabase
      .from("email_sequence_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", "welcome")
      .single();

    if (existing) {
      return NextResponse.json({ skipped: true });
    }

    const { subject, html } = welcomeEmail(user.email);

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject,
      html,
    });

    // Log that welcome was sent
    await supabase.from("email_sequence_log").insert({
      user_id: user.id,
      email: user.email,
      email_type: "welcome",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[email/welcome]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
