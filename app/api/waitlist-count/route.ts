import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "waitlist.json");
    const existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    return NextResponse.json({ count: Array.isArray(existing) ? existing.length : 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
