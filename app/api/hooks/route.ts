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

  const { subject, contentType } = await request.json();
  if (!subject) return Response.json({ error: "subject required" }, { status: 400 });

  const prompt = `Ești un expert în copywriting viral și psihologia atenției pe social media.
Generează exact 12 hook-uri pentru prima propoziție a unui post pe tema: "${subject}"
${contentType ? `Tip conținut: ${contentType}` : ""}

Returnează UN SINGUR JSON valid, fără text suplimentar:
{
  "hooks": [
    { "text": "<hook complet, gata de folosit>", "type": "curiozitate", "explanation": "<de ce funcționează psihologic, 1 propoziție scurtă>" },
    { "text": "...", "type": "șoc", "explanation": "..." },
    { "text": "...", "type": "controversă", "explanation": "..." },
    { "text": "...", "type": "statistică", "explanation": "..." },
    { "text": "...", "type": "poveste personală", "explanation": "..." },
    { "text": "...", "type": "întrebare directă", "explanation": "..." },
    { "text": "...", "type": "curiozitate", "explanation": "..." },
    { "text": "...", "type": "șoc", "explanation": "..." },
    { "text": "...", "type": "controversă", "explanation": "..." },
    { "text": "...", "type": "statistică", "explanation": "..." },
    { "text": "...", "type": "poveste personală", "explanation": "..." },
    { "text": "...", "type": "întrebare directă", "explanation": "..." }
  ]
}

Reguli:
- Fiecare hook trebuie să fie diferit ca structură, lungime și abordare
- Hook-urile de același tip (ex: cele 2 de curiozitate) trebuie să fie complet diferite
- Hook-urile trebuie să fie în română, naturale, nu traduse mecanic
- Lungimea variază: unele scurte (5-8 cuvinte), altele medii (10-15 cuvinte)
- Nu include ghilimele duble în interiorul textului hook-ului

Răspunde DOAR cu JSON-ul, fără markdown.`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const result = JSON.parse(cleaned);

  // Deduct 1 credit (fire-and-forget)
  supabase.from("user_credits")
    .update({ credits: creditsRow.credits - 1 })
    .eq("user_id", user.id).then(() => {});

  return Response.json({ hooks: result.hooks, creditsRemaining: creditsRow.credits - 1 });
}
