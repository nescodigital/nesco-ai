import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [profileRes, historyRes, updatesRes] = await Promise.all([
    supabase.from("brand_profiles").select("data").eq("user_id", user.id).single(),
    supabase
      .from("generation_history")
      .select("content_type, objective, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("business_updates")
      .select("text")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(3),
  ]);

  const profile = (profileRes.data?.data as Record<string, unknown>) ?? {};
  const history = historyRes.data ?? [];
  const updates = updatesRes.data ?? [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentTypes = history
    .filter((h) => h.created_at > sevenDaysAgo)
    .map((h) => h.content_type);
  const last30 = history.filter((h) => h.created_at > thirtyDaysAgo);

  const channels = (profile.channels as string[]) ?? [];
  const brandName = (profile.brand_name as string) ?? "brandul tău";
  const frequency = (profile.frequency as string) ?? "săptămânal";

  const prompt = `Ești un expert în strategie de conținut digital.

Brand: ${brandName}
Canale active: ${channels.length > 0 ? channels.join(", ") : "neprecizate"}
Frecvență postare: ${frequency}
Noutăți business active: ${updates.length > 0 ? updates.map((u) => u.text).join("; ") : "niciuna"}
Conținut generat în ultimele 7 zile: ${recentTypes.length > 0 ? recentTypes.join(", ") : "nimic"}
Conținut generat în ultimele 30 zile (tip + obiectiv): ${last30.length > 0 ? last30.map((h) => `${h.content_type} (${h.objective})`).join(", ") : "niciuna"}

Analizează situația și returnează DOAR un JSON valid, fără explicații sau markdown:
{
  "message": "mesaj scurt în română (max 2 propoziții) care explică DE CE recomanzi asta — specific, bazat pe date reale",
  "contentType": "unul din: Post Facebook | Post Instagram | Post LinkedIn | Email newsletter | Reclamă Meta Ads",
  "objective": "unul din: Vânzare | Awareness | Engagement | Promovare ofertă specială",
  "context": "context scurt (1 frază) pentru generator, bazat pe noutățile active sau situația brandului"
}

Reguli:
- Dacă userul nu a postat pe o platformă în 7 zile, recomand-o
- Uită-te la distribuția obiectivelor din 30 zile — dacă a făcut prea mult awareness, recomandă vânzare și invers
- Dacă există business updates active, includle în context
- Dacă nu există date, recomandă ceva generic dar util`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    // Strip potential markdown code blocks
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const suggestion = JSON.parse(cleaned);
    return Response.json(suggestion);
  } catch {
    return Response.json({ error: "parse_error" }, { status: 500 });
  }
}
