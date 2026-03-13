import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const body = await req.text();
    stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 400 });
  }
}
