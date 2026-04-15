import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PAID_UNLOCKS_COOKIE = "dmme_paid_unlocks";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST() {
  const cookieStore = await cookies();

  const current = Number(cookieStore.get(PAID_UNLOCKS_COOKIE)?.value || "0");
  const next = Math.max(0, current - 1);

  cookieStore.set(PAID_UNLOCKS_COOKIE, String(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return NextResponse.json({ paidUnlocks: next });
}