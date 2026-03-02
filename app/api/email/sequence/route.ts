import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { day2Email, day5Email } from "@/lib/email-templates";

// This endpoint is called by a cron job (e.g. Vercel Cron or external scheduler).
// Set up cron to call GET /api/email/sequence every hour with header:
//   Authorization: Bearer <CRON_SECRET>
//
// Required SQL (run in Supabase SQL editor):
// CREATE TABLE email_sequence_log (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   email TEXT NOT NULL,
//   email_type TEXT NOT NULL, -- 'welcome' | 'day2' | 'day5'
//   sent_at TIMESTAMPTZ DEFAULT now()
// );
// ALTER TABLE email_sequence_log ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Service role only" ON email_sequence_log USING (false);
//
// Also ensure auth.users has created_at accessible — it does by default.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Nesco Digital AI <noreply@nescodigital.com>";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  // Auth check
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const now = new Date();
  let sent = 0;
  let errors = 0;

  // Fetch all users from auth (using service role)
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 500 });
  if (usersError || !users) {
    return NextResponse.json({ error: "Could not fetch users" }, { status: 500 });
  }

  for (const user of users.users) {
    if (!user.email) continue;

    const signupDate = new Date(user.created_at);
    const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60);

    // Fetch already sent emails for this user
    const { data: logs } = await supabase
      .from("email_sequence_log")
      .select("email_type")
      .eq("user_id", user.id);

    const sentTypes = new Set((logs || []).map((l: { email_type: string }) => l.email_type));

    // Day 2 email: send between 44h and 52h after signup
    if (hoursSinceSignup >= 44 && hoursSinceSignup < 52 && !sentTypes.has("day2")) {
      try {
        const { subject, html } = day2Email(user.email);
        await resend.emails.send({ from: FROM, to: user.email, subject, html });
        await supabase.from("email_sequence_log").insert({
          user_id: user.id,
          email: user.email,
          email_type: "day2",
          sent_at: now.toISOString(),
        });
        sent++;
      } catch {
        errors++;
      }
    }

    // Day 5 email: send between 116h and 124h after signup
    if (hoursSinceSignup >= 116 && hoursSinceSignup < 124 && !sentTypes.has("day5")) {
      try {
        const { subject, html } = day5Email(user.email);
        await resend.emails.send({ from: FROM, to: user.email, subject, html });
        await supabase.from("email_sequence_log").insert({
          user_id: user.id,
          email: user.email,
          email_type: "day5",
          sent_at: now.toISOString(),
        });
        sent++;
      } catch {
        errors++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors, checkedAt: now.toISOString() });
}
