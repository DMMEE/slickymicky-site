import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { type, name, suburb } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://slickymicky-site-poek.vercel.app";
    const priceOneTime = process.env.STRIPE_PRICE_ONE_TIME;
    const priceSub = process.env.STRIPE_PRICE_SUB;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    if (type !== "single" && type !== "sub") {
      return NextResponse.json(
        { error: "Invalid checkout type" },
        { status: 400 }
      );
    }

    const priceId = type === "single" ? priceOneTime : priceSub;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            type === "single"
              ? "Missing STRIPE_PRICE_ONE_TIME"
              : "Missing STRIPE_PRICE_SUB",
        },
        { status: 500 }
      );
    }

    const mode: Stripe.Checkout.SessionCreateParams.Mode =
      type === "single" ? "payment" : "subscription";

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        purchase_type: type,
        name: typeof name === "string" ? name : "",
        suburb: typeof suburb === "string" ? suburb : "",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 500 }
    );
  }
}