import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { brandId = 1, insights } = await request.json();
  if (!insights) return Response.json({ error: "insights required" }, { status: 400 });

  // Fetch current brand profile
  const { data: profileRow } = await supabase
    .from("brand_profiles")
    .select("data")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .single();

  if (!profileRow) return Response.json({ error: "Brand profile not found" }, { status: 404 });

  const current = (profileRow.data as Record<string, unknown>) ?? {};

  // Merge insights into existing profile — only update fields provided
  const updated: Record<string, unknown> = { ...current };
  if (insights.usp) updated.usp = insights.usp;
  if (Array.isArray(insights.tone_words) && insights.tone_words.length > 0) updated.tone_words = insights.tone_words;
  if (insights.buying_decision) updated.buying_decision = insights.buying_decision;

  await supabase
    .from("brand_profiles")
    .update({ data: updated })
    .eq("user_id", user.id)
    .eq("brand_id", brandId);

  return Response.json({ ok: true });
}
