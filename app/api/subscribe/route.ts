import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { name, suburb } = await req.json();

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://slickymicky-site-r5ox.vercel.app/";
    const priceSub = process.env.STRIPE_PRICE_SUB;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    if (!priceSub) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_SUB" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceSub, quantity: 1 }],
      success_url: `${baseUrl}/success?type=sub&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        purchase_type: "sub",
        name: typeof name === "string" ? name : "",
        suburb: typeof suburb === "string" ? suburb : "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("SUBSCRIBE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create subscription session.",
      },
      { status: 500 }
    );
  }
}