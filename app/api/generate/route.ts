import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENERS = [
  "{name}, someone in {suburb} keeps noticing you more than they planned to.",
  "You have been on someone's mind in {suburb}, {name}.",
  "{name}, you leave something behind in {suburb} that people keep returning to.",
  "Someone around {suburb} is feeling a little too drawn to you, {name}.",
  "{name}, there is a reason people in {suburb} keep looking twice.",
  "You have that effect on people in {suburb}, {name}.",
  "{name}, someone in {suburb} is definitely more curious than they should be.",
  "There is someone in {suburb} thinking about you again, {name}.",
];

const SECOND_LINES = [
  "You can usually feel it before they say anything.",
  "They are trying to play it cool, but they are not hiding it well.",
  "The attention suits you more than you let on.",
  "You make it very easy for people to want a little more.",
  "You have been harder to forget than they expected.",
  "Some people are better at staring than speaking.",
  "You already know the kind of energy this is.",
  "It is not always obvious, but it is rarely accidental.",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function fill(template: string, name: string, suburb: string) {
  return template.replaceAll("{name}", name).replaceAll("{suburb}", suburb);
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

    const seedOpening = fill(pick(OPENERS), name, suburb);
    const seedSecond = pick(SECOND_LINES);

    const prompt = `
You are writing a short seductive entertainment message for a fictional website called Slicky Micky.

Goal:
Make the message feel personal, magnetic, and slightly eerie, like someone is noticing them, thinking about them, or wanting them.

Hard rules:
- Write exactly 2 short sentences.
- Total length: 16 to 26 words.
- Use the user's first name naturally.
- Use the suburb naturally.
- The message should feel smooth, alluring, intimate, and addictive.
- Focus on themes like attention, attraction, curiosity, desire, being noticed, being wanted, or being hard to forget.
- Keep it subtle.
- Do not sound aggressive, threatening, obsessive, or scary.
- Do not mention watching, stalking, secrets, surveillance, hacking, or private information.
- Do not claim real facts.
- No emojis.
- No hashtags.
- No poetry.
- No mention of AI.
- Output only the final message.

Tone:
- seductive
- intriguing
- confident
- slightly eerie
- emotionally sharp
- short and commercially catchy

Use these as inspiration, but rewrite naturally:
Sentence 1 vibe: ${seedOpening}
Sentence 2 vibe: ${seedSecond}

Name: ${name}
Suburb: ${suburb}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.25,
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You write short, seductive, emotionally sticky entertainment lines that make people feel noticed, wanted, and hard to forget.",
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
        { error: "No message was generated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
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