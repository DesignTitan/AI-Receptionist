import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/setup/extract — turn what the owner just said (voice transcript)
 * into card fields. Claude reads the exchange and returns only the fields it
 * is sure about; without ANTHROPIC_API_KEY the client uses its own parsers.
 */
const Body = z.object({
  said: z.string().min(1).max(1000),
  asked: z.string().max(600).optional(),
  known: z.record(z.string(), z.unknown()).optional(),
});

const Patch = z.object({
  phone: z.string().nullable(),
  businessName: z.string().nullable(),
  trade: z.enum(["salon", "studio", "other"]).nullable(),
  customTrade: z.string().nullable(),
  address: z.string().nullable(),
  days: z.array(z.number().int().min(0).max(6)).nullable(),
  opens: z.string().nullable(),
  closes: z.string().nullable(),
  minutes: z.number().int().nullable(),
  answering: z.enum(["always", "after_hours", "backup", "choice"]).nullable(),
});

const SYSTEM = `You extract setup answers from what a business owner said to Bubs, an AI receptionist, during a spoken interview. Return only fields the owner clearly stated in this utterance; everything else null. Rules: phone as (NXX) NXX-XXXX; trade salon covers salons, spas, barbers, nails, massage, wellness; studio covers photography, art, recording, dance, tattoo; anything else is other with customTrade in a few words; days as numbers 0=Sunday..6=Saturday, expand ranges ("Tuesday to Saturday" → [2,3,4,5,6], "weekdays" → [1..5], "every day" → all seven); opens/closes as 24-hour HH:MM (open 24 hours → opens 00:00, closes 24:00; a closing time without am/pm before 12 means pm); minutes snapped to one of 15,30,45,60,90,120,180,240; answering: every call/any time → always, only after hours/when closed → after_hours, when the team can't/if nobody picks up/after a few rings → backup, callers press 1 or 2/let them choose → choice. Never guess.`;

export async function POST(request: Request) {
  let body: z.infer<typeof Body>;
  try { body = Body.parse(await request.json()); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ configured: false });
  const client = new Anthropic();
  try {
    const r = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 800,
      output_config: { effort: "low", format: zodOutputFormat(Patch) },
      system: SYSTEM,
      messages: [{ role: "user", content: `${body.asked ? `Bubs asked: "${body.asked}"\n` : ""}Owner said: "${body.said}"\nAlready on the card: ${JSON.stringify(body.known ?? {})}` }],
    });
    if (!r.parsed_output) return NextResponse.json({ configured: true, patch: null });
    return NextResponse.json({ configured: true, patch: r.parsed_output });
  } catch {
    return NextResponse.json({ configured: true, patch: null });
  }
}
