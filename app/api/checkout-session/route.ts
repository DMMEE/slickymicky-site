import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    });
  } catch (error: any) {
    console.error("Retrieve session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}