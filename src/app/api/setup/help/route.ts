import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/setup/help — a question about filling in the setup card.
 * With ANTHROPIC_API_KEY, Bubs answers in context; without it the client falls
 * back to the built-in answers, and this route says so.
 */

const Body = z.object({
  question: z.string().min(1).max(600),
  card: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  missing: z.array(z.string()).max(10).optional(),
});

const SYSTEM = `You are Bubs, an AI phone receptionist, helping a small business owner fill in a short setup card about their business. The card has: business phone, business name, business type, address, business hours (when customers can book), appointment length, and when Bubs answers the phone (every call / only after hours / when the team can't pick up / callers choose).
Answer the owner's question in two or three plain sentences. Be concrete and practical. If they ask what to put, suggest a sensible default and say why. Never invent facts about their business beyond what the card says. No lists, no headings, no emoji.`;

export async function POST(request: Request) {
  let body: z.infer<typeof Body>;
  try { body = Body.parse(await request.json()); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ configured: false });
  const client = new Anthropic();
  const card = body.card ? Object.entries(body.card).filter(([, v]) => v !== null && v !== "").map(([k, v]) => `${k}: ${v}`).join("\n") : "(empty)";
  try {
    const r = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 600,
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{ role: "user", content: `Card so far:\n${card}\n\nStill missing: ${body.missing?.length ? body.missing.join(", ") : "nothing"}\n\nQuestion: ${body.question}` }],
    });
    const text = r.content.find(b => b.type === "text")?.text?.trim();
    if (!text) return NextResponse.json({ configured: true, error: "No answer came back." });
    return NextResponse.json({ configured: true, answer: text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ configured: true, error: "Busy right now." });
    return NextResponse.json({ configured: true, error: "Unavailable right now." });
  }
}
