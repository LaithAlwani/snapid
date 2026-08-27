import { v } from "convex/values";
import { action } from "./_generated/server";

const SYSTEM = `You are the booking assistant for SnapID — Passport & ID Photos, a small Canadian-owned home studio in Riverside South / Barrhaven, Ottawa. Home studio, mobile service, baby & newborn specialists. Appointment only, no walk-ins.

We photograph ID photos for EVERY country, not just Canada — passport, visa, PR card, citizenship and other ID. We size and crop to the destination country's published spec. If a customer names a country, give the general requirement shape (size, head height, background) but tell them we confirm the current official spec before the shoot; never invent exact millimetre numbers you are unsure of.

IMPORTANT ORDER: before quoting photo prices, first find out whether they want to come to our studio or have us come to them (mobile), so they understand any travel fee up front. Mobile service is added once per visit, not per person: +$75 within 20 km, +$99 up to 40 km, beyond 40 km we quote (send them to the contact form).

Prices (printed set, plus HST):
- Adult $19.99
- Child 5+ $24.99
- Toddler 1+ $29.99
- Under 1 year $35.99
Digital copies are $5 less than the physical (adult digital only $14.99; under-1 digital only $29.99). Adding a digital copy on top of any physical image is only $10 extra.

Appointment length depends on who is coming: each adult or child (5+) takes about 10 minutes, each toddler (1+) about 15 minutes, and each baby (under 1) about 30 minutes. Ask for the exact number of adults, children 5+, toddlers 1+ and babies under 1 so the photographer reserves enough time.

Included: compliance guaranteed with a free reshoot if a photo is rejected, sized and cropped per country spec, newborn posing done safely on-site, same-day appointments when available. Other languages spoken. No payment online — cash or e-transfer at the appointment.

Hours: appointments run 9:00 am to 7:00 pm, seven days a week.

Be brief and concrete: two or three short sentences, no bullet lists unless asked, no emoji. When someone wants to book, collect studio-vs-mobile first, then name, phone, email, country, photo type, the party counts, and a preferred day/time, then call prefill_booking. Don't ask for everything at once — two or three items per message.

The customer can change their mind at any time. If they revise ANY detail — for example switching from mobile to coming into the studio, changing how many people are coming, the country, the photo type, or the delivery option — acknowledge it and call prefill_booking again with just the corrected field(s). You may call prefill_booking with a partial set of fields; only include what changed. Crucially, if they switch to the studio there is NO travel fee, so drop it from any price you quote and re-quote the corrected total.`;

const PREFILL_TOOL = {
  name: "prefill_booking",
  description:
    "Fill or update the booking form with details the customer has provided or changed. Call this whenever the customer states or revises a detail — you may include only the field(s) that changed (e.g. just place='studio' when they decide to come in instead of mobile).",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      phone: { type: "string" },
      email: { type: "string" },
      country: { type: "string" },
      docType: {
        type: "string",
        enum: ["Passport", "Visa", "PR card", "Citizenship", "Other ID"],
      },
      counts: {
        type: "object",
        description:
          "How many of each. Every field is a count; use 0 when none.",
        properties: {
          adult: { type: "number" },
          child: { type: "number" },
          toddler: { type: "number" },
          baby: { type: "number" },
        },
      },
      deliverable: { type: "string", enum: ["print", "digital", "both"] },
      place: { type: "string", enum: ["studio", "near", "far", "beyond"] },
      address: { type: "string" },
      notes: { type: "string" },
    },
  },
} as const;

const OFFLINE_REPLY =
  "I can't reach the assistant right now, but the booking form above works — or call (613) 000-0000 and we'll sort it out.";

type ChatMessage = { role: "user" | "assistant"; content: string };

function textFromContent(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b): b is { type: "text"; text: string } => {
      return (
        typeof b === "object" &&
        b !== null &&
        (b as { type?: unknown }).type === "text"
      );
    })
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ reply: string; prefill: Record<string, unknown> | null }> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { reply: OFFLINE_REPLY, prefill: null };
    }

    const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

    // Anthropic Messages API content blocks accumulate across the tool round-trip.
    const apiMessages: Array<{ role: "user" | "assistant"; content: unknown }> =
      args.messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      }));

    let prefill: Record<string, unknown> | null = null;

    try {
      // Up to two passes: one to (optionally) call the tool, one for the reply.
      for (let pass = 0; pass < 2; pass++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 700,
            system: SYSTEM,
            tools: [PREFILL_TOOL],
            messages: apiMessages,
          }),
        });

        if (!res.ok) {
          console.error("Anthropic error", res.status, await res.text());
          return { reply: OFFLINE_REPLY, prefill };
        }

        const data = (await res.json()) as {
          content: Array<Record<string, unknown>>;
          stop_reason: string;
        };

        const toolUses = data.content.filter(
          (b) => b.type === "tool_use" && b.name === "prefill_booking",
        );

        if (data.stop_reason === "tool_use" && toolUses.length > 0) {
          // Record the model's turn, then answer each tool call.
          apiMessages.push({ role: "assistant", content: data.content });
          const toolResults = toolUses.map((tu) => {
            const input = (tu.input as Record<string, unknown>) ?? {};
            const clean: Record<string, unknown> = {};
            for (const [k, val] of Object.entries(input)) {
              if (val !== undefined && val !== null && val !== "") clean[k] = val;
            }
            prefill = { ...(prefill ?? {}), ...clean };
            return {
              type: "tool_result",
              tool_use_id: tu.id,
              content:
                "Booking form filled with those details. Tell the customer to pick a day and time in the Book section and press Request this appointment.",
            };
          });
          apiMessages.push({ role: "user", content: toolResults });
          continue; // ask the model for its natural-language reply
        }

        const reply = textFromContent(data.content);
        return { reply: reply || OFFLINE_REPLY, prefill };
      }

      return { reply: OFFLINE_REPLY, prefill };
    } catch (err) {
      console.error("chat action failed", err);
      return { reply: OFFLINE_REPLY, prefill };
    }
  },
});
