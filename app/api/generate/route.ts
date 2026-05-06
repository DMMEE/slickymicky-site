import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const LINES = [
  "{name}, someone in {suburb} keeps looking a little longer than they should.",
  "You caught someone’s attention in {suburb}, {name}. They haven’t dropped it.",
  "{name}, someone in {suburb} is definitely noticing you more than once.",
  "You’ve been on someone’s mind in {suburb}, {name}. Not in a casual way.",
  "{name}, someone in {suburb} likes the way you carry yourself.",
  "There’s someone in {suburb} thinking about you again, {name}.",
  "{name}, someone in {suburb} keeps remembering you at the wrong moments.",
  "You made an impression in {suburb}, {name}. It stuck a little too well.",
];

const ENDINGS = [
  "You’d know exactly who if you thought about it.",
  "They’re not as subtle as they think.",
  "It’s not as quiet as they believe.",
  "You’ve probably noticed it too.",
  "They’re trying not to make it obvious.",
  "It’s starting to show.",
  "They’re getting a little careless about it.",
  "You’re not imagining it.",
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(str: string, name: string, suburb: string) {
  return str.replaceAll("{name}", name).replaceAll("{suburb}", suburb);
}

export async function POST(req: NextRequest) {
  try {
    const { name, suburb } = await req.json();

    if (!name || !suburb) {
      return NextResponse.json(
        { error: "Name and suburb are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const seedLine = fill(pick(LINES), name, suburb);
    const seedEnding = pick(ENDINGS);

    const prompt = `
You are writing a short, simple, slightly eerie and flirty message.

Rules:
- 1 or 2 sentences only
- 12–20 words total
- Very direct and natural
- No poetic language
- No fluff
- No explanations
- No emojis
- No hashtags
- No mention of AI
- Do not sound creepy or aggressive
- Focus on attention, attraction, being noticed, or being wanted
- Make it slightly blush-inducing

Use this as inspiration, but rewrite naturally:
${seedLine} ${seedEnding}

Name: ${name}
Suburb: ${suburb}

Return only the message.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.1,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content:
            "You write short, direct, flirty and slightly eerie lines that feel real and make people want another.",
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
        { error: "No message generated." },
        { status: 500 }
      );
    }

  const PAYMENT_HOOKS = [
  "The next message gets closer.",
  "There’s more to this than you think.",
  "The next one is more direct.",
  "You’ll know exactly why if you keep going.",
  "The next message reveals more.",
  "This isn’t finished yet.",
];

const finalMessage = `${message} ${PAYMENT_HOOKS[Math.floor(Math.random() * PAYMENT_HOOKS.length)]}`;

return NextResponse.json({ message: finalMessage });

  } catch (error) {
    console.error("GENERATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate message.",
      },
      { status: 500 }
    );
  }
}