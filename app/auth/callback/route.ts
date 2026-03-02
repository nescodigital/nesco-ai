import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const locale = searchParams.get("locale") ?? "ro";
  const prefix = locale === "en" ? "/en" : "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      // Process referral if present in user metadata (fire-and-forget)
      if (user) {
        const referralCode = user.user_metadata?.referral_code as string | undefined;
        if (referralCode) {
          const admin = createAdminClient();
          admin.from("referral_codes")
            .select("user_id")
            .eq("code", referralCode)
            .maybeSingle()
            .then(({ data: codeRow }) => {
              if (codeRow && codeRow.user_id !== user.id) {
                admin.from("referrals").upsert({
                  referrer_user_id: codeRow.user_id,
                  referred_user_id: user.id,
                  referral_code: referralCode,
                }, { onConflict: "referred_user_id", ignoreDuplicates: true }).then(() => {});
              }
            });
        }
      }

      // If a specific `next` param was provided, respect it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Otherwise check if user has completed onboarding
      if (user) {
        const { data: profile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        return NextResponse.redirect(`${origin}${prefix}${profile ? "/dashboard" : "/onboarding"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${prefix}/login?error=auth_callback_failed`);
}
