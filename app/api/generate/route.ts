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

    const cleanHistory = Array.isArray(history)
      ? history.filter((item) => typeof item === "string").slice(-6)
      : [];

    const messageNumber = cleanHistory.length + 1;

    const previousMessagesText = cleanHistory.length
      ? cleanHistory.map((msg, index) => `${index + 1}. ${msg}`).join("\n")
      : "No previous messages.";

    const prompt = `
You are Slicky Micky.

You write short mysterious entertainment messages.

IMPORTANT:
The user's name MUST appear in every message.

User name:
${name}

User suburb:
${suburb}

Message number:
${messageNumber}

Previous messages:
${previousMessagesText}

Your job:
Write the NEXT message in the same storyline.

This must feel like a continuation, not a new reading.

CONTINUATION RULES:
- If this is message 1, introduce that someone has noticed ${name}.
- If this is message 2, directly refer to the first message using words like "the person I mentioned", "that person", or "the one I hinted at".
- If this is message 3, refer to the previous message using words like "that small moment", "what happened before", or "the thing they remembered".
- If this is message 4, refer to hesitation, timing, or something left unsaid.
- If this is message 5 or more, continue deepening the same mystery.

STRICT RULES:
- ONE sentence only.
- 14 to 26 words total.
- Must include the name "${name}".
- Must continue from the previous messages.
- Do not create a new unrelated person.
- Do not restart the story.
- Do not contradict the previous messages.
- Do not identify a real person.
- Do not claim to actually know private information.
- Do not say you are watching, tracking, following, or stalking them.
- No threats.
- No sexual explicit wording.
- No emojis.
- No hashtags.
- No explanation.
- No horoscope language.
- Return only the message.

EXAMPLES OF LINKED MESSAGES:

Message 1:
"${name}, someone around ${suburb} has noticed you more than once, and it probably is not who you expect."

Message 2:
"${name}, the person I mentioned before is not completely random; there has already been a small moment between you."

Message 3:
"${name}, that small moment stayed with them longer than they expected, even if you barely thought about it."

Message 4:
"${name}, they have thought about saying something before, but the timing keeps making them hesitate."

Now write message number ${messageNumber}.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You are Slicky Micky. You must continue the same storyline and include the user's name in every message.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let message = response.choices[0]?.message?.content?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "No message generated." },
        { status: 500 }
      );
    }

    if (!message.toLowerCase().includes(name.toLowerCase())) {
      message = `${name}, ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
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