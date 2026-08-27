"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import nodemailer from "nodemailer";
import {
  PLACES,
  DELIVERABLE_LABELS,
  partySummary,
  formatDuration,
  money,
} from "../lib/pricing";

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${DOW[date.getDay()]}, ${MON[m - 1]} ${d}, ${y}`;
}

export const sendBookingConfirmation = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const b = await ctx.runQuery(internal.bookings.getForEmail, {
      id: args.bookingId,
    });
    if (!b) return null;

    const host = process.env.SMTP_HOST;
    if (!host) {
      console.warn(
        "SMTP_HOST not set — skipping SnapID confirmation email. Configure SMTP_* env vars to enable.",
      );
      return null;
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    // Many SMTP hosts reject a From that isn't the authenticated mailbox
    // ("553 Sender is not allowed to relay"). Prefer an explicit SMTP_FROM,
    // otherwise send from the SMTP_USER address with a friendly display name.
    const userAddr =
      process.env.SMTP_USER && process.env.SMTP_USER.includes("@")
        ? `SnapID <${process.env.SMTP_USER}>`
        : undefined;
    const from =
      process.env.MAIL_FROM ??
      process.env.SMTP_FROM ??
      userAddr ??
      "SnapID <hello@snapid.ca>";
    const place = PLACES[b.place];
    const when = `${prettyDate(b.date)} at ${b.slot}`;
    const totalStr =
      b.place === "beyond"
        ? `${money(b.estimateTotal)} + travel (quoted separately)`
        : money(b.estimateTotal);

    const lines = [
      `Hi ${b.name},`,
      "",
      "Your SnapID appointment is confirmed. Here are the details:",
      "",
      `When:      ${when} (${formatDuration(b.durationMinutes)})`,
      `Who:       ${partySummary(b.counts)}`,
      `Photo:     ${b.docType} for ${b.country} — ${DELIVERABLE_LABELS[b.deliverable]}`,
      `Where:     ${place.label}${b.place !== "studio" && b.address ? ` — ${b.address}` : ""}`,
      `Estimate:  ${totalStr} (plus HST already included)`,
      "",
      "No payment now — cash or e-transfer at the appointment. If you're coming",
      "to the studio, we'll send the exact address separately. Need to change or",
      "cancel? Just reply to this email or call (613) 000-0000.",
      "",
      "See you soon,",
      "SnapID — Passport & ID Photos",
      "Riverside South / Barrhaven, Ottawa",
    ];

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0B1526">
        <div style="background:#10233C;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
          <div style="font-size:20px;font-weight:800">Your appointment is confirmed</div>
          <div style="color:#9EC0FF;font-size:14px;margin-top:4px">SnapID — Passport &amp; ID Photos</div>
        </div>
        <div style="border:1px solid #E4EAF3;border-top:0;border-radius:0 0 12px 12px;padding:24px">
          <p style="margin:0 0 16px">Hi ${b.name}, thanks for booking. Here are your details:</p>
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            ${row("When", `${when} · ${formatDuration(b.durationMinutes)}`)}
            ${row("Who", partySummary(b.counts))}
            ${row("Photo", `${b.docType} for ${b.country} — ${DELIVERABLE_LABELS[b.deliverable]}`)}
            ${row("Where", `${place.label}${b.place !== "studio" && b.address ? ` — ${b.address}` : ""}`)}
            ${row("Estimate", totalStr)}
          </table>
          <p style="margin:16px 0 0;color:#59697E;font-size:14px;line-height:1.5">
            No payment now — cash or e-transfer at the appointment. Coming to the studio? We'll send the exact address separately. Need to change or cancel? Reply to this email or call (613) 000-0000.
          </p>
        </div>
      </div>`;

    try {
      await transport.sendMail({
        from,
        to: b.email,
        subject: `Your SnapID appointment — ${when}`,
        text: lines.join("\n"),
        html,
      });
    } catch (err) {
      console.error("Failed to send SnapID confirmation email", err);
    }
    return null;
  },
});

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#59697E;white-space:nowrap;vertical-align:top">${label}</td>
    <td style="padding:6px 0 6px 16px;font-weight:600;color:#10233C">${value}</td>
  </tr>`;
}
