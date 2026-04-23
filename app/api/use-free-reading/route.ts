import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FREE_COOKIE = "dmme_free_used_at";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set(FREE_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SEVEN_DAYS_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("USE FREE READING ERROR:", error);

    return NextResponse.json(
      { error: "Could not mark free reading as used." },
      { status: 500 }
    );
  }
}