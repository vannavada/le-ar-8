"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import { cn } from "@/lib/utils";

// ── keyword routing ────────────────────────────────────────────────────────

const KEYWORD_MAP: Record<string, string[]> = {
  "finance-hub": [
    "money", "mortgage", "mortgages", "invest", "investment", "investments",
    "tax", "taxes", "stock", "stocks", "finance", "financial", "budget",
    "crypto", "bitcoin", "salary", "nri", "nris", "portfolio", "savings",
    "loan", "loans", "interest", "rate", "rates", "wealth", "retire",
    "retirement", "debt", "mutual", "fund", "funds", "dividend", "equity",
    "banking", "bank", "insurance", "pension",
  ],
  "tech-vault": [
    "gadget", "gadgets", "review", "reviews", "car", "cars", "phone",
    "phones", "laptop", "laptops", "tech", "technology", "keyboard",
    "headphone", "headphones", "monitor", "monitors", "mechanical", "camera",
    "cameras", "gaming", "tablet", "tablets", "watch", "watches", "earbuds",
    "speaker", "speakers", "gpu", "cpu", "ram", "setup", "desk", "mouse",
    "best", "electric", "ev",
  ],
  "thought-forge": [
    "career", "work", "industry", "strategy", "leadership", "management",
    "business", "startup", "startups", "professional", "productivity",
    "essay", "article", "opinion", "analysis", "market", "economy",
    "enterprise", "consulting", "hiring", "job", "jobs", "advice",
  ],
  "mindstream": [
    "thought", "thoughts", "life", "personal", "feeling", "feelings",
    "journal", "story", "mood", "mental", "health", "meditation", "reflect",
    "daily", "habit", "habits", "anxiety", "motivation", "mindset",
  ],
  "learn-hub": [
    "learn", "learning", "course", "courses", "tutorial", "tutorials",
    "study", "education", "skill", "skills", "training", "guide", "guides",
    "beginner", "explained", "teach", "teaching", "how",
  ],
  "community": [
    "community", "forum", "discussion", "discussions", "group", "groups",
    "social", "network", "people", "connect",
  ],
};

function findBestHub(query: string): string | null {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (!words.length) return null;
  const scores: Record<string, number> = {};
  for (const [hub, keywords] of Object.entries(KEYWORD_MAP)) {
    scores[hub] = 0;
    for (const word of words)
      for (const kw of keywords)
        if (word === kw || word.startsWith(kw) || kw.startsWith(word))
          scores[hub]++;
  }
  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return best && best[1] > 0 ? best[0] : null;
}

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// [/8] terminal submit affordance — teal slash, foreground brackets
function TerminalSubmit() {
  return (
    <span className="font-mono font-bold text-sm leading-none select-none tracking-tight">
      <span className="text-foreground opacity-60">[</span>
      <span style={{ color: "#00D9CC" }}>/</span>
      <span className="text-foreground opacity-60">8]</span>
    </span>
  );
}

// ── component ──────────────────────────────────────────────────────────────

interface Props {
  randomHref: string | null;
}

export function HomepageHero({ randomHref }: Props) {
  const [value, setValue] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const router = useRouter();

  function submit() {
    const q = value.trim();
    if (!q) return;
    const hub = findBestHub(q);
    if (hub) {
      const match = SECTIONS.find((s) => s.slug === hub);
      if (match) { router.push(match.href); return; }
    }
    setNoMatch(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (noMatch) setNoMatch(false);
  }

  return (
    <section className="relative flex items-center justify-center min-h-[82vh] px-6 sm:px-10 overflow-hidden">

      {/* ── Watermark — [/8] as atmospheric background texture ─────────────
          Strictly behind content (no z-index), pointer-events-none.
          Single faint foreground color — no teal accent in the watermark.
          opacity-[0.05] light / opacity-[0.08] dark: just barely perceptible.  */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span
          className="font-mono font-bold text-foreground opacity-[0.04] dark:opacity-[0.06]"
          style={{ fontSize: "clamp(14rem, 28vw, 38rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          [/8]
        </span>
      </div>

      {/* ── Content — centered column, above watermark ───────────────────── */}
      <div className="relative z-10 w-full max-w-5xl animate-fade-in flex flex-col items-center">

        {/* Headline — centered, single line on desktop */}
        <h1
          className="w-full text-center font-serif font-normal text-foreground tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 4.5vw + 1.4rem, 5rem)", lineHeight: 1.06 }}
        >
          What are you in the mood for?
        </h1>

        {/* Intent field — solid bg over watermark, [/8] submit on right */}
        <div className="mt-8 w-full">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Try 'mortgages for NRIs' or 'best mechanical keyboard'…"
              className={cn(
                "w-full rounded-xl border border-border",
                "bg-background dark:bg-card",   // always solid — content readable over watermark
                "px-6 py-5 pr-16 text-lg text-foreground",
                "placeholder:text-muted-foreground/50",
                "transition-[border-color] duration-200 ease-in-out",
                "focus:outline-none focus:border-primary",
              )}
            />
            <button
              onClick={submit}
              aria-label="Submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-muted focus:outline-none"
            >
              <TerminalSubmit />
            </button>
          </div>

          {/* "or cast me adrift" — centered below field as alternative action */}
          {randomHref !== null && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              or{" "}
              <button
                onClick={() => router.push(randomHref!)}
                className="underline underline-offset-2 decoration-muted-foreground/40 hover:text-foreground hover:decoration-foreground transition-colors duration-150"
              >
                cast me adrift
              </button>
            </p>
          )}
        </div>

        {/* No-match inline hint — centered */}
        {noMatch && (
          <p className="mt-3 text-sm text-muted-foreground text-center animate-fade-in">
            Nothing obvious — try a hub below, or rephrase with simpler words.
          </p>
        )}

        {/* Hub chips — centered row; solid bg ensures legibility over watermark */}
        <div className="mt-6 flex flex-wrap lg:flex-nowrap gap-2 justify-center">
          {SECTIONS.map((s) => (
            <button
              key={s.slug}
              onClick={() => router.push(s.href)}
              className="whitespace-nowrap rounded-full border bg-background dark:bg-card px-3 py-1.5 text-sm font-medium transition-transform duration-150 hover:scale-[1.03]"
              style={{ color: s.color, borderColor: rgba(s.color, 0.3) }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = rgba(s.color, 0.1);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ""; // restore CSS class bg
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
