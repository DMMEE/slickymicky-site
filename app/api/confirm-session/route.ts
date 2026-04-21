import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PAID_UNLOCKS_COOKIE = "dmme_paid_unlocks";
const SUBSCRIPTION_COOKIE = "dmme_subscription_active";
const CONFIRMED_SESSIONS_COOKIE = "dmme_confirmed_sessions";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout session is not complete." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const confirmedRaw =
      cookieStore.get(CONFIRMED_SESSIONS_COOKIE)?.value || "";
    const confirmedSessions = confirmedRaw ? confirmedRaw.split(",") : [];

    if (confirmedSessions.includes(sessionId)) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const purchaseType = session.metadata?.purchase_type;

    if (purchaseType === "sub") {
      cookieStore.set(SUBSCRIPTION_COOKIE, "true", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });
    } else {
      const currentUnlocks = Number(
        cookieStore.get(PAID_UNLOCKS_COOKIE)?.value || "0"
      );
      const nextUnlocks = currentUnlocks + 1;

      cookieStore.set(PAID_UNLOCKS_COOKIE, String(nextUnlocks), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });
    }

    const updatedConfirmed = [...confirmedSessions, sessionId]
      .slice(-20)
      .join(",");

    cookieStore.set(CONFIRMED_SESSIONS_COOKIE, updatedConfirmed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });

    return NextResponse.json({ ok: true });
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