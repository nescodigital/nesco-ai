import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const PLANS: Record<string, { priceId: string; credits: number }> = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 60 },
  pro: { priceId: process.env.STRIPE_PRICE_PRO!, credits: 200 },
  "multi-brand": { priceId: process.env.STRIPE_PRICE_MULTI_BRAND!, credits: 600 },
};

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json();
  const planData = PLANS[plan];
  if (!planData) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    billing_address_collection: "required",
    custom_fields: [
      {
        key: "company_name",
        label: { type: "custom", custom: "Nume firmă (opțional)" },
        type: "text",
        optional: true,
      },
      {
        key: "cui",
        label: { type: "custom", custom: "CUI / cod fiscal (opțional)" },
        type: "text",
        optional: true,
      },
    ],
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgrade=success`,
    cancel_url: `${origin}/pricing`,
    metadata: { user_id: user.id, plan, credits: planData.credits.toString() },
    tax_id_collection: { enabled: true },
  });

  return Response.json({ url: session.url });
}
