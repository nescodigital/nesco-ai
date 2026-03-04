import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const FOUNDING_TOTAL = 200;
const FOUNDING_OFFSET = 36; // pre-seeded count

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("user_credits")
      .select("*", { count: "exact", head: true })
      .not("plan", "is", null);

    const realCount = (count ?? 0) + FOUNDING_OFFSET;
    const remaining = Math.max(0, FOUNDING_TOTAL - realCount);

    return NextResponse.json({ remaining, taken: realCount, total: FOUNDING_TOTAL });
  } catch {
    return NextResponse.json({ remaining: 164, taken: 36, total: 200 });
  }
}
