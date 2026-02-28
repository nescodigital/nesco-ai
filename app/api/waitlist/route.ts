import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const {
    name = "",
    email = "",
    phone = "",
    businessType = "",
    website = "",
    budget = "",
    teamSize = "",
    frustration = "",
    callOpen = "",
    lang = "ro",
  } = body;

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // ── a) Save to data/waitlist.json ──────────────────────────────────────────
  const dataPath = path.join(process.cwd(), "data", "waitlist.json");
  let existing: unknown[] = [];
  try {
    existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  } catch {
    existing = [];
  }
  existing.push({
    name,
    email,
    phone,
    businessType,
    website,
    budget,
    teamSize,
    frustration,
    callOpen,
    lang,
    createdAt: new Date().toISOString(),
  });
  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));

  // ── b) Confirmation email to subscriber ────────────────────────────────────
  const isRo = lang === "ro";
  const confirmSubject = isRo
    ? "Ești pe listă! Te anunțăm când lansăm."
    : "You're on the list! We'll notify you at launch.";

  const confirmHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <tr>
          <td style="padding:40px 40px 32px;text-align:center;">
            <img src="https://i0.wp.com/nescodigital.com/wp-content/uploads/2024/09/nescodigital-logo-invert.png" alt="Nesco Digital" style="height:28px;width:auto;margin-bottom:24px;display:block;margin-left:auto;margin-right:auto;" />
            <p style="margin:0 0 24px;display:inline-block;background:rgba(86,219,132,0.1);border:1px solid rgba(86,219,132,0.3);color:#56db84;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:999px;">
              Nesco Digital AI
            </p>
            <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:800;line-height:1.2;">
              ${isRo ? "Ești pe listă!" : "You're on the list!"}
            </h1>
            <p style="margin:0 0 32px;color:#a1a1aa;font-size:16px;line-height:1.6;">
              ${
                isRo
                  ? "Îți vom trimite un email imediat ce lansăm accesul anticipat. Mersi că crezi în ce construim."
                  : "We'll email you as soon as early access opens. Thanks for believing in what we're building."
              }
            </p>
            <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
              ${isRo ? "Nu trimitem spam. Niciodată." : "We never send spam. Ever."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:#52525b;font-size:12px;">
              &copy; ${new Date().getFullYear()} Nesco Digital
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ── c) Notification email to alex@ ────────────────────────────────────────
  const notifHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:32px;">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;border:1px solid #e4e4e7;">
    <tr><td>
      <h2 style="margin:0 0 24px;font-size:20px;color:#111;">Waitlist nou: ${name} - ${email}</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ["Nume", name],
          ["Email", email],
          ["Telefon", phone],
          ["Tip business", businessType],
          ["Website", website],
          ["Buget", budget],
          ["Marime echipa", teamSize],
          ["Frustrare principala", frustration],
          ["Deschis la call", callOpen],
          ["Limba", lang],
        ]
          .map(
            ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;background:#f9f9f9;font-size:13px;color:#71717a;width:180px;border-radius:4px;">${label}</td>
          <td style="padding:8px 12px;font-size:13px;color:#111;font-weight:600;">${value || "-"}</td>
        </tr>`
          )
          .join("")}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const results = await Promise.allSettled([
    resend.emails.send({
      from: "noreply@nescodigital.com",
      to: email,
      subject: confirmSubject,
      html: confirmHtml,
    }),
    resend.emails.send({
      from: "noreply@nescodigital.com",
      to: "alex@nescodigital.com",
      subject: `Waitlist nou: ${name} - ${email}`,
      html: notifHtml,
    }),
    fetch("https://t.themarketer.com/api/v1/add_subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        k: process.env.THEMARKETER_REST_KEY,
        u: process.env.THEMARKETER_CUSTOMER_ID,
        email,
        firstname: name,
        phone,
        add_tags: "nesco-ai-waitlist",
        channels: "email",
      }),
    }).then(r => r.text()).then(text => { console.log('TheMarketer response:', text); return text; }),
  ]);

  const errors = results
    .map((r, i) => r.status === 'rejected' ? `Task ${i}: ${r.reason}` : null)
    .filter(Boolean);

  console.log('Waitlist results:', JSON.stringify(results.map((r, i) => ({
    task: i === 0 ? 'confirm_email' : i === 1 ? 'notify_email' : 'themarketer',
    status: r.status,
    value: r.status === 'fulfilled' ? r.value : (r as PromiseRejectedResult).reason?.message,
  }))));

  return NextResponse.json({ ok: true, errors });
}
