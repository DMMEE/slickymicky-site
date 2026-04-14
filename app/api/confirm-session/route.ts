import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PAID_UNLOCKS_COOKIE = "dmme_paid_unlocks";
const SUBSCRIPTION_COOKIE = "dmme_subscription_active";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete") {
      return NextResponse.json(
        { error: "Payment not complete" },
        { status: 400 }
      );
    }

    const purchaseType = session.metadata?.purchase_type;
    const cookieStore = await cookies();

    if (purchaseType === "sub") {
      cookieStore.set(SUBSCRIPTION_COOKIE, "true", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });

      return NextResponse.json({ ok: true, type: "subscription" });
    }

    const current = Number(cookieStore.get(PAID_UNLOCKS_COOKIE)?.value || "0");
    const next = current + 1;

    cookieStore.set(PAID_UNLOCKS_COOKIE, String(next), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });

    return NextResponse.json({ ok: true, type: "single", paidUnlocks: next });
  } catch (error) {
    console.error("CONFIRM SESSION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm payment",
      },
      { status: 500 }
    );
  }
}