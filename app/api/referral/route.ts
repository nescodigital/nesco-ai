import { createClient, createAdminClient } from "@/lib/supabase/server";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Get or create referral code
  let { data: codeRow } = await admin
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!codeRow) {
    // Generate unique code (retry if collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await admin
        .from("referral_codes")
        .select("code")
        .eq("code", code)
        .maybeSingle();
      if (!existing) break;
      code = generateCode();
      attempts++;
    }
    const { data: inserted } = await admin
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select("code")
      .single();
    codeRow = inserted;
  }

  // Get stats
  const { data: referrals } = await admin
    .from("referrals")
    .select("id, rewarded_at")
    .eq("referrer_user_id", user.id);

  const totalReferred = referrals?.length ?? 0;
  const totalRewarded = referrals?.filter((r) => r.rewarded_at).length ?? 0;

  const code = codeRow?.code ?? "";
  const referralLink = `https://ai.nescodigital.com/signup?ref=${code}`;

  return Response.json({ code, referralLink, totalReferred, totalRewarded });
}
