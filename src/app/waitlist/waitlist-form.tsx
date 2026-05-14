"use client";

import { useState, useTransition } from "react";
import { joinWaitlistAction } from "./actions";

const MAX_REASON = 500;

export function WaitlistForm({
  defaultEmail,
  source,
}: {
  defaultEmail: string;
  source: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.append("email", email.trim());
    fd.append("reason", reason.trim());
    fd.append("source", source);

    startTransition(async () => {
      const result = await joinWaitlistAction(fd);
      if (result && "error" in result) {
        setError(result.error ?? "Unknown error");
      } else if (result && "success" in result) {
        setSuccess(true);
      }
    });
  }

  // Estado post-submit exitoso
  if (success) {
    return (
      <div className="border border-[var(--color-border-strong)] bg-[var(--color-paper)] p-6">
        <p className="font-display text-2xl mb-2 text-[var(--color-ink)]">
          Saved.
        </p>
        <p className="text-[15px] text-[var(--color-ink-soft)]">
          We&rsquo;ll email{" "}
          <span className="text-[var(--color-ink)]">{email}</span> when
          unlimited access opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label-speaker block mb-2 text-[var(--color-ink-soft)]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          className="w-full px-4 py-3 bg-[var(--color-paper)] border border-[var(--color-border-strong)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-colors font-sans text-[15px] disabled:opacity-50"
        />
      </div>

      <div>
        <label className="label-speaker block mb-2 text-[var(--color-ink-soft)]">
          What conversations would you practice?{" "}
          <span className="italic text-[var(--color-ink-faded)] normal-case">
            (optional)
          </span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
          disabled={isPending}
          rows={3}
          placeholder="e.g. interview prep, sales pitches, English fluency for work..."
          className="w-full px-4 py-3 bg-[var(--color-paper)] border border-[var(--color-border-strong)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faded)] placeholder:italic focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none font-sans text-[15px] disabled:opacity-50"
        />
        <div className="text-xs text-[var(--color-ink-faded)] mt-1 text-right">
          {reason.length} / {MAX_REASON}
        </div>
      </div>

      {error && (
        <p className="text-sm italic text-[var(--color-accent)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !email}
        className="px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] tracking-wider text-sm uppercase hover:bg-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Saving..." : "Save my seat →"}
      </button>
    </form>
  );
}
