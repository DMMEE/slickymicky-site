import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const FREE_COOKIE = "usedFreeMessage";
const CREDITS_COOKIE = "paidCredits";
const SUB_COOKIE = "isSubscriber";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "Missing OPENAI_API_KEY in env." },
        { status: 500 }
      );
    }

    const { name, suburb, question } = await req.json();

    const isSubscriber = req.cookies.get(SUB_COOKIE)?.value === "true";
    const usedFree = req.cookies.get(FREE_COOKIE)?.value === "true";
    const paidCredits = Number(req.cookies.get(CREDITS_COOKIE)?.value || "0");

    if (!isSubscriber && usedFree && paidCredits <= 0) {
      return NextResponse.json({
        message:
          "You’ve used your free message. Buy another for $2 or subscribe.",
      });
    }

    const roastAllowed = Math.random() < 0.2;
    const tonePick = ["soft", "nostalgic", "ominous", "warm-then-dark", "cheeky"][
      Math.floor(Math.random() * 5)
    ];

    const prompt = `
You write short, emotionally charged, eerie messages for a paid entertainment site.

Hard rules:
- 1–2 sentences only.
- 10–28 words.
- Must include the user's name and suburb naturally.
- Emotional core is mandatory (longing, hope, guilt, nostalgia, relief, desire).
- Add a subtle eerie twist, but keep it emotional.
- Vary wording each time; avoid repetitive openings.
- ${roastAllowed ? "Add a LIGHT playful roast at the end (teasing, not cruel)." : "No roast."}
- No threats, no slurs, no protected traits, no 'as an AI', no disclaimers.

Tone variant: ${tonePick}

Name: ${name || "Friend"}
Suburb: ${suburb || "your area"}
User message: ${question || ""}
`;

    const ai = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.95,
      input: prompt,
    });

    const text = ai.output_text?.trim() || "Something is watching your silence… try again.";

    const res = NextResponse.json({ message: text });

    // Consume free/paid credit (subscribers consume nothing)
    if (!isSubscriber) {
      if (!usedFree) {
        res.cookies.set(FREE_COOKIE, "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      } else if (paidCredits > 0) {
        res.cookies.set(CREDITS_COOKIE, String(paidCredits - 1), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      }
    }

    return res;
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}