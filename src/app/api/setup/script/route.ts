import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/setup/script — help with what Bubs says on a call.
 *   mode "suggest": three rewrites of the current script.
 *   mode "review":  one line of feedback on the customer's edit plus a revised version they can accept.
 * Without ANTHROPIC_API_KEY it answers { configured:false } and the UI says so; nothing is invented.
 */

const Body = z.object({
  mode: z.enum(["suggest", "review"]),
  kind: z.enum(["incoming", "outgoing"]),
  script: z.string().min(1).max(1200),
  business: z.object({ name: z.string().max(120), trade: z.string().max(120).optional(), hours: z.string().max(200).optional(), minutes: z.number().optional() }),
});

const Suggestions = z.object({ suggestions: z.array(z.string()).length(3) });
const Review = z.object({ feedback: z.string(), revised: z.string(), keepAsIs: z.boolean() });

const RULES = `You help a small business owner word what Bubs, their AI phone receptionist, says out loud on calls.
Rules for every script you write:
- Spoken English, one breath per sentence, no headings or bullet points, no emoji.
- 40 words or fewer. It is read aloud by a voice agent.
- Keep any placeholders exactly as written: {customer}, {day}, {time}.
- Never promise things the script doesn't already state (prices, guarantees, availability).
- Sound warm and plain, like a good front-desk person, not like marketing copy.`;

export async function POST(request: Request) {
  let body: z.infer<typeof Body>;
  try { body = Body.parse(await request.json()); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ configured: false });
  const client = new Anthropic();
  const context = `Business: ${body.business.name}${body.business.trade ? ` (${body.business.trade})` : ""}.${body.business.hours ? ` Hours: ${body.business.hours}.` : ""}${body.business.minutes ? ` Appointments are ${body.business.minutes} minutes.` : ""}\nCall type: ${body.kind === "incoming" ? "a customer is calling the business; this is the first thing they hear" : "Bubs is calling a customer to confirm an appointment they already booked"}.`;
  try {
    if (body.mode === "suggest") {
      const r = await client.messages.parse({
        model: "claude-opus-5",
        max_tokens: 2000,
        output_config: { effort: "low", format: zodOutputFormat(Suggestions) },
        system: RULES,
        messages: [{ role: "user", content: `${context}\n\nCurrent script:\n"${body.script}"\n\nWrite three alternative versions that say the same things in a different voice: one warmer, one shorter, one more professional. Return only the scripts.` }],
      });
      if (!r.parsed_output) return NextResponse.json({ configured: true, error: "No suggestions came back." });
      return NextResponse.json({ configured: true, suggestions: r.parsed_output.suggestions });
    }
    const r = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2000,
      output_config: { effort: "low", format: zodOutputFormat(Review) },
      system: RULES,
      messages: [{ role: "user", content: `${context}\n\nThe owner wrote this script themselves:\n"${body.script}"\n\nGive one or two sentences of practical feedback a receptionist trainer would give (length, clarity, anything missing that callers need, anything that will sound odd spoken aloud). Then give a revised version that keeps their wording and intent, changing only what the feedback calls for. If it is already good, say so, set keepAsIs to true, and return their script unchanged as revised.` }],
    });
    if (!r.parsed_output) return NextResponse.json({ configured: true, error: "No feedback came back." });
    return NextResponse.json({ configured: true, ...r.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ configured: true, error: "Busy right now — try again in a moment." });
    if (error instanceof Anthropic.AuthenticationError) return NextResponse.json({ configured: true, error: "Suggestions aren’t set up correctly on this server." });
    if (error instanceof Anthropic.APIError) return NextResponse.json({ configured: true, error: "Suggestions are unavailable right now." });
    return NextResponse.json({ configured: true, error: "Suggestions are unavailable right now." });
  }
}
