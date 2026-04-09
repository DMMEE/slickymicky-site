import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, name, suburb } = await req.json();

    const openaiKey = process.env.OPENAI_API_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    if (!stripeKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const prompt = `
Write one short, direct, slightly eerie and flirty message.

Rules:
- 1 or 2 sentences only
- 12–20 words total
- Natural, simple, blush-inducing
- Focus on someone noticing them, thinking about them, or wanting them
- No poetry
- No mention of AI

Name: ${typeof name === "string" ? name : ""}
Suburb: ${typeof suburb === "string" ? suburb : ""}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.1,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content:
            "You write short, flirty, eerie, addictive lines that feel personal and real.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const message = response.choices[0]?.message?.content?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "No message generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}