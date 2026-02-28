import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If a specific `next` param was provided, respect it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Otherwise check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        return NextResponse.redirect(`${origin}${profile ? "/dashboard" : "/onboarding"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
