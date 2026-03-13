import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID as string,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000?subscribed=true",
      cancel_url: "http://localhost:3000?canceled=true",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe subscription error:", error);
    return NextResponse.json(
      { error: "Stripe subscription failed" },
      { status: 500 }
    );
  }
}