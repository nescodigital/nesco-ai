import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG, type Locale, type PlanId } from "@/lib/plans";

const PLAN_CREDITS: Record<PlanId, number> = {
  starter: 60,
  pro: 200,
  "multi-brand": 600,
};

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, locale = "ro" } = await request.json();
  const loc = (locale === "en" ? "en" : "ro") as Locale;
  const planConfig = PLAN_CONFIG[loc][plan as PlanId];
  if (!planConfig) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const priceId = planConfig.priceId;
  if (!priceId) return Response.json({ error: "Price not configured" }, { status: 500 });

  const credits = PLAN_CREDITS[plan as PlanId] ?? 0;
  const origin = new URL(request.url).origin;
  const prefix = loc === "en" ? "/en" : "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    billing_address_collection: "required",
    custom_fields: [
      {
        key: "company_name",
        label: { type: "custom", custom: "Nume firmă / Company name (opțional)" },
        type: "text",
        optional: true,
      },
      {
        key: "cui",
        label: { type: "custom", custom: "CUI / VAT ID (opțional)" },
        type: "text",
        optional: true,
      },
    ],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${prefix}/dashboard?upgrade=success`,
    cancel_url: `${origin}${prefix}/pricing`,
    metadata: { user_id: user.id, plan, credits: credits.toString() },
    tax_id_collection: { enabled: true },
  });

  return Response.json({ url: session.url });
}
