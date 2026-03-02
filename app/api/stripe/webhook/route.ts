import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits || "0");

    if (userId && credits > 0) {
      // Use admin client — webhook runs outside user session
      const supabase = createAdminClient();

      // Add credits
      const { data: existing } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single();

      const plan = session.metadata?.plan ?? null;
      if (existing) {
        await supabase
          .from("user_credits")
          .update({ credits: existing.credits + credits, plan, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("user_credits")
          .insert({ user_id: userId, credits, plan });
      }

      // Extract billing data from custom fields for invoicing (SmartBill)
      const customFields = session.custom_fields ?? [];
      const companyName = customFields.find((f) => f.key === "company_name")?.text?.value ?? null;
      const cui = customFields.find((f) => f.key === "cui")?.text?.value ?? null;
      const billingAddress = session.customer_details?.address ?? null;
      const customerEmail = session.customer_details?.email ?? null;
      const customerName = session.customer_details?.name ?? null;

      // Referral reward — only on first purchase
      const { data: referralRow } = await supabase
        .from("referrals")
        .select("id, referrer_user_id, rewarded_at")
        .eq("referred_user_id", userId)
        .maybeSingle();

      if (referralRow && !referralRow.rewarded_at) {
        const referrerId = referralRow.referrer_user_id;
        // Add 30 credits to referrer
        const { data: refCredits } = await supabase
          .from("user_credits").select("credits").eq("user_id", referrerId).single();
        if (refCredits) {
          await supabase.from("user_credits")
            .update({ credits: refCredits.credits + 30 })
            .eq("user_id", referrerId);
        }
        // Add 30 credits to referred user (existing record updated above already)
        const { data: newCredits } = await supabase
          .from("user_credits").select("credits").eq("user_id", userId).single();
        if (newCredits) {
          await supabase.from("user_credits")
            .update({ credits: newCredits.credits + 30 })
            .eq("user_id", userId);
        }
        // Mark as rewarded
        await supabase.from("referrals")
          .update({ rewarded_at: new Date().toISOString() })
          .eq("id", referralRow.id);
      }

      // Save billing info for SmartBill / accounting
      // (plan already extracted above)
      await supabase.from("billing_info").upsert({
        user_id: userId,
        stripe_session_id: session.id,
        customer_name: customerName,
        customer_email: customerEmail,
        company_name: companyName,
        cui,
        address_line: billingAddress?.line1 ?? null,
        address_city: billingAddress?.city ?? null,
        address_country: billingAddress?.country ?? null,
        address_postal_code: billingAddress?.postal_code ?? null,
        plan,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  }

  return Response.json({ received: true });
}
