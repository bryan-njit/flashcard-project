import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkCards } from "@/lib/checkCards";
import { isRateLimited } from "@/lib/rateLimit";

// making the cards can take a while, so give the function up to 60s on vercel
export const maxDuration = 60;

const MODEL = "claude-opus-5";
const MAX_NOTES_LENGTH = 15000;

const SYSTEM_PROMPT = `You turn a student's class notes into study flashcards.
Make one card for each important fact, term, or idea in the notes.
Keep questions short and specific, and keep answers to one or two sentences.
Only use information from the notes. Make between 5 and 20 cards depending on how much material there is.`;

// Claude has to reply with JSON in exactly this shape
const cardsSchema = {
  type: "object",
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["cards"],
  additionalProperties: false,
};

export async function POST(req: Request) {
  // vercel puts the visitor's IP address in this header
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You're making cards too fast. Wait a minute and try again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!notes) {
    return NextResponse.json({ error: "Paste some notes first." }, { status: 400 });
  }
  if (notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json(
      { error: `Your notes are too long. The limit is ${MAX_NOTES_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The server is missing ANTHROPIC_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  const client = new Anthropic();

  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: notes }],
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: cardsSchema },
      },
      // if the safety filter wrongly flags the notes (like notes from a security class),
      // the API retries on a backup model instead of refusing
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The API key is invalid. Check ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests right now. Try again in a minute." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong talking to Claude. Try again." },
      { status: 502 }
    );
  }

  if (response.stop_reason === "refusal") {
    return NextResponse.json(
      { error: "Claude couldn't make flashcards from these notes." },
      { status: 422 }
    );
  }

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") text += block.text;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Claude's response wasn't valid JSON. Try again." },
      { status: 502 }
    );
  }

  // don't trust the response just because it's JSON
  const problem = checkCards(data);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 502 });
  }

  return NextResponse.json({ cards: data.cards });
}
