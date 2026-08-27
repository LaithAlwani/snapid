"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, ErrorBanner } from "./Dialog";

const inputCls =
  "min-h-[46px] w-full rounded-[10px] border border-white/25 bg-white/[0.06] px-[13px] py-3 text-white placeholder:text-on-navy-muted focus:border-brand-bright focus:outline-none";

export function Contact() {
  const submit = useMutation(api.contact.submitContact);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [v, setV] = useState({ name: "", contact: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!v.name.trim() || !v.contact.trim() || !v.message.trim()) {
      setError("Please fill in all three fields.");
      return;
    }
    setBusy(true);
    try {
      await submit(v);
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="contact" className="bg-navy text-white">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-[34px] px-[18px] py-16 md:grid-cols-2">
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent-on-navy">
            Contact
          </h2>
          <p className="mt-3 font-heading text-[28px] font-bold leading-[1.2]">
            Questions, or a trip past 40 km?
          </p>
          <div className="mt-6 grid gap-3.5 text-[16.5px]">
            <div>
              <span className="text-on-navy-muted">Phone</span>
              <br />
              <a href="tel:+16130000000" className="font-semibold text-white">
                (613) 000-0000
              </a>
            </div>
            <div>
              <span className="text-on-navy-muted">Email</span>
              <br />
              <a href="mailto:hello@snapid.ca" className="font-semibold text-white">
                hello@snapid.ca
              </a>
            </div>
            <div>
              <span className="text-on-navy-muted">Studio</span>
              <br />
              Riverside South / Barrhaven, Ottawa
              <br />
              <span className="text-[15px] text-on-deep">
                Exact address sent with your confirmation
              </span>
            </div>
            <div>
              <span className="text-on-navy-muted">Hours</span>
              <br />
              By appointment — no walk-ins
              <br />
              <span className="text-[15px] text-on-deep">
                Early mornings, daytime, evenings and weekends
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl border border-white/15 bg-white/[0.06] p-[22px]"
        >
          {sent ? (
            <div className="animate-pop py-5">
              <div className="font-heading text-[22px] font-extrabold">
                Message sent
              </div>
              <p className="mt-2.5 text-base leading-[1.55] text-on-navy">
                Thanks — we reply within one business day.
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5">
              <label className="grid gap-1.5 text-sm font-semibold text-on-navy">
                Name
                <input
                  type="text"
                  required
                  value={v.name}
                  onChange={(e) => setV({ ...v, name: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-on-navy">
                Email or phone
                <input
                  type="text"
                  required
                  value={v.contact}
                  onChange={(e) => setV({ ...v, contact: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-on-navy">
                Message
                <textarea
                  rows={4}
                  required
                  value={v.message}
                  onChange={(e) => setV({ ...v, message: e.target.value })}
                  placeholder="Country, document type, where you are"
                  className={`${inputCls} resize-y`}
                />
              </label>
              <ErrorBanner message={error} />
              <button
                type="submit"
                disabled={busy}
                className="min-h-[50px] rounded-full bg-brand p-[15px] text-base font-bold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </div>
          )}
        </form>
      </div>

      <Dialog
        open={failed}
        title="Message didn’t send"
        tone="error"
        onClose={() => setFailed(false)}
      >
        Something went wrong on our end. Please try again, or email us directly
        at hello@snapid.ca.
      </Dialog>
    </section>
  );
}
