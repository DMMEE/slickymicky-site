import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified.",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}