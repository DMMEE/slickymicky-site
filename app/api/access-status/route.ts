import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FREE_COOKIE = "dmme_free_used_at";
const PAID_UNLOCKS_COOKIE = "dmme_paid_unlocks";
const SUBSCRIPTION_COOKIE = "dmme_subscription_active";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const cookieStore = await cookies();

    const freeUsedAt = Number(cookieStore.get(FREE_COOKIE)?.value || "0");
    const paidUnlocks = Number(
      cookieStore.get(PAID_UNLOCKS_COOKIE)?.value || "0"
    );
    const subscriptionActive =
      cookieStore.get(SUBSCRIPTION_COOKIE)?.value === "true";

    const freeUsed =
      Number.isFinite(freeUsedAt) && freeUsedAt > 0
        ? Date.now() - freeUsedAt < SEVEN_DAYS_MS
        : false;

    return NextResponse.json({
      freeUsed,
      paidUnlocks: Number.isFinite(paidUnlocks) ? paidUnlocks : 0,
      subscriptionActive,
    });
  } catch (error) {
    console.error("ACCESS STATUS ERROR:", error);

    return NextResponse.json(
      {
        freeUsed: false,
        paidUnlocks: 0,
        subscriptionActive: false,
      },
      { status: 200 }
    );
  }
}