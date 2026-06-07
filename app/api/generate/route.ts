import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const PAYMENT_HOOKS = [
  "Slicky knows a little more.",
  "The next message gets closer.",
  "There’s more to this than you think.",
  "The next one is more direct.",
  "You might want to hear what comes next.",
  "This isn’t finished yet.",
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
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

    const prompt = `
You are Slicky Micky.

You write short, addictive, personal messages that feel seductive, mysterious, and slightly unsettling in a playful way.

The user gives you:
Name: ${name}
Suburb: ${suburb}

Your message should feel like Slicky knows just enough to make them curious.

STYLE:
- Personal
- Flirty
- Seductive
- Smooth
- Mysterious
- Slightly eerie
- Natural, not poetic
- Make them want another message

RULES:
- 1 sentence only
- 14 to 24 words total
- Use their name naturally
- Sometimes use their suburb, but only if it sounds natural
- No emojis
- No hashtags
- No AI mention
- No explanation
- No threats
- No aggressive wording
- No sexual explicit content
- No claiming to actually watch, track, stalk, or know private facts
- No horoscope language
- No generic motivation

GOOD EXAMPLES:
"Michael, someone keeps pretending they forgot you, but their mind gives them away at the worst times."

"Jess, there’s someone who acts calm around you, but notices every little change."

"Sarah from Richmond, someone remembers your energy more clearly than they probably should."

"Daniel, someone gets quieter when your name comes up, and that says more than they realise."

"Emma, someone is trying very hard not to seem interested, but they are losing that little game."

BAD EXAMPLES:
"You will find love soon."
"The universe has a plan for you."
"I am watching you."
"Someone is stalking you."
"You are entering a new chapter."

Return only the message.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.15,
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You are Slicky Micky, a seductive, mysterious entertainment character who writes short personal messages that create curiosity.",
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

    const finalMessage = `${message} ${pick(PAYMENT_HOOKS)}`;

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