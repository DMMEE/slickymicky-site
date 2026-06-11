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
    const { name, suburb, history = [] } = await req.json();

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

    const messageNumber = history.length + 1;

    const prompt = `
You are Slicky Micky.

You create short mysterious entertainment messages.

The user believes they are unlocking the next part of a mystery.

User:
Name: ${name}
Suburb: ${suburb}

This is message number:
${messageNumber}

Previous Slicky messages:
${history.length ? history.join("\n") : "No previous messages."}

Your job:
Continue the same storyline.

DO NOT restart.
DO NOT create a random new story.
The new message must feel connected to the previous messages.

STORY FLOW:

Message 1:
Hint that someone has noticed them.

Message 2:
Suggest this person is not completely random.

Message 3:
Hint at a small interaction, moment, conversation, or memory.

Message 4:
Suggest hesitation or something unsaid.

Message 5+:
Go deeper into the mystery without revealing a person.

STYLE:
- Personal
- Flirty
- Smooth
- Mysterious
- Slightly eerie
- Addictive
- Natural conversation style

RULES:
- ONE sentence only
- 14 to 24 words
- Use their name naturally
- Use suburb sometimes only
- Never identify an actual person
- Never claim real knowledge
- Never say you are watching them
- No stalking language
- No threats
- No explicit sexual wording
- No horoscope wording
- No emojis
- No hashtags
- No explanation
- Do not repeat previous messages

GOOD EXAMPLES:

Message 1:
"Michael, someone around Richmond has noticed you more than once, and it probably is not who you expect."

Message 2:
"The interesting thing Michael, is this person is not completely new; there has already been a small moment between you."

Message 3:
"That moment was simple, maybe a look or conversation, but something about it stayed with them longer than expected."

Message 4:
"Michael, they have thought about saying something before, but timing has made them hold back."

BAD EXAMPLES:

"I know who likes you."
"I am watching you."
"Someone followed you."
"The universe is sending love."
"Your soulmate is coming."

Return ONLY the next Slicky Micky message.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.05,
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You are Slicky Micky. Continue mysterious entertainment storylines while keeping them playful and safe.",
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

    return NextResponse.json({
      message: finalMessage,
    });

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