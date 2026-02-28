import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const PLANS: Record<string, { priceId: string; credits: number }> = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 50 },
  pro: { priceId: process.env.STRIPE_PRICE_PRO!, credits: 300 },
  unlimited: { priceId: process.env.STRIPE_PRICE_UNLIMITED!, credits: 99999 },
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
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgrade=success`,
    cancel_url: `${origin}/pricing`,
    metadata: { user_id: user.id, plan, credits: planData.credits.toString() },
  });

  return Response.json({ url: session.url });
}
