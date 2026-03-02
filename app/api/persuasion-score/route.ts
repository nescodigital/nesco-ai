import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: creditsRow } = await supabase
    .from("user_credits").select("credits").eq("user_id", user.id).single();
  if (!creditsRow || creditsRow.credits < 1)
    return Response.json({ error: "no_credits" }, { status: 402 });

  const { text } = await request.json();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  const prompt = `Ești un expert în copywriting persuasiv și psihologia vânzărilor.
Analizează textul de mai jos și returnează UN SINGUR JSON valid cu structura exactă:

{
  "overall": <număr 0-100>,
  "dimensions": {
    "loss_aversion": { "score": <0-100>, "label": "Frică de pierdere", "feedback": "<max 1 propoziție concretă>" },
    "credibility": { "score": <0-100>, "label": "Credibilitate", "feedback": "<max 1 propoziție concretă>" },
    "cta_clarity": { "score": <0-100>, "label": "Claritate CTA", "feedback": "<max 1 propoziție concretă>" },
    "attention_retention": { "score": <0-100>, "label": "Retenție atenție", "feedback": "<max 1 propoziție concretă>" }
  },
  "weak_point": "<fraza exactă din text unde cititorul pierde interesul, sau mesaj scurt dacă textul e bun>",
  "improvements": ["<sugestie concretă și acționabilă 1>", "<sugestie concretă 2>", "<sugestie concretă 3>"]
}

Scorul overall = media ponderată a celor 4 dimensiuni.
Fii critic și realist — scoruri între 40-85 sunt normale, nu da 90+ dacă nu merită.

TEXT DE ANALIZAT:
${text}

Răspunde DOAR cu JSON-ul, fără text suplimentar, fără markdown.`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const result = JSON.parse(cleaned);

  // Deduct 1 credit (fire-and-forget)
  supabase.from("user_credits")
    .update({ credits: creditsRow.credits - 1 })
    .eq("user_id", user.id).then(() => {});

  return Response.json({ result, creditsRemaining: creditsRow.credits - 1 });
}
