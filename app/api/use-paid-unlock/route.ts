import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PAID_UNLOCKS_COOKIE = "dmme_paid_unlocks";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST() {
  try {
    const cookieStore = await cookies();

    const current = Number(
      cookieStore.get(PAID_UNLOCKS_COOKIE)?.value || "0"
    );

    // consume exactly one paid unlock
    const next = Math.max(0, current - 1);

    cookieStore.set(PAID_UNLOCKS_COOKIE, String(next), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });

    return NextResponse.json({
      paidUnlocks: next,
    });
  } catch (error) {
    console.error("USE PAID UNLOCK ERROR:", error);

    return NextResponse.json(
      { error: "Could not consume paid unlock." },
      { status: 500 }
    );
  }
}