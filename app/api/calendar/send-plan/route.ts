import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { calendarPlanEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slots, weekLabel } = await request.json();
  if (!slots || slots.length === 0) return NextResponse.json({ error: "No slots" }, { status: 400 });

  const email = user.email!;
  const { subject, html } = calendarPlanEmail({ slots, weekLabel });

  await resend.emails.send({
    from: "Nesco Digital AI <noreply@nescodigital.com>",
    to: email,
    subject,
    html,
  });

  return NextResponse.json({ ok: true });
}
