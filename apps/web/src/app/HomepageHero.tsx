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

// [/8] terminal submit affordance inside the field
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
    // Flex column: watermark sits above the content group; both centered together.
    <section className="relative flex flex-col items-center justify-center min-h-[82vh] px-6 sm:px-10 overflow-hidden">

      {/* ── Watermark — centered above content, faint atmospheric element ──────
          In normal flex flow (not absolute) so it stays above the content group
          at all widths including mobile. pointer-events-none keeps it inert.  */}
      <div className="pointer-events-none select-none flex justify-center w-full" aria-hidden="true">
        <span
          className="font-mono font-bold text-foreground opacity-[0.05] dark:opacity-[0.07]"
          style={{ fontSize: "clamp(8rem, 22vw, 26rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          [/8]
        </span>
      </div>

      {/* ── Tagline — whispers beneath the [/8] logo ──────────────────────── */}
      <p className="pointer-events-none select-none text-center text-xs tracking-widest text-foreground/30 dark:text-foreground/25 mt-3">
        the human layer of the internet
      </p>

      {/* ── Content — centered below watermark ────────────────────────────── */}
      <div className="relative z-10 w-full max-w-3xl animate-fade-in flex flex-col items-center mt-6 sm:mt-8">

        {/* Headline */}
        <h1
          className="w-full text-center font-serif font-normal text-foreground tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 4.5vw + 1.4rem, 5rem)", lineHeight: 1.06 }}
        >
          What are you in the mood for?
        </h1>

        {/* Intent field */}
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
                "bg-background dark:bg-card",
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
        </div>

        {/* "Cast me adrift" — typographic invitation, NOT a chip or button shape.
            Italic Instrument Serif phrase with wave icon; lives between the field
            and the hub chips as the "or let me choose for you" sibling of search. */}
        {randomHref !== null && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push(randomHref!)}
              className="group flex items-center gap-2.5 focus:outline-none"
            >
              {/* Wave icon — drifts upward gently on hover */}
              <svg
                viewBox="0 0 20 10"
                width="20"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-primary flex-shrink-0 transition-transform duration-700 group-hover:-translate-y-1.5"
                aria-hidden="true"
              >
                <path d="M1 5 c3-5 7-5 9 0 c3 5 7 5 9 0" />
              </svg>
              {/* Copy: quiet Inter lead-in + italic serif phrase + arrow */}
              <span className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground font-normal">Not sure?</span>
                <span
                  className="font-serif text-primary"
                  style={{ fontSize: "1.05rem", lineHeight: 1 }}
                >
                  Cast me adrift
                </span>
                <span className="text-primary text-xs">→</span>
              </span>
            </button>
          </div>
        )}

        {/* No-match hint */}
        {noMatch && (
          <p className="mt-3 text-sm text-muted-foreground text-center animate-fade-in">
            Nothing obvious — try a hub below, or rephrase with simpler words.
          </p>
        )}

        {/* Hub chips — single row at sm+, wraps on mobile */}
        <div className="mt-7 flex flex-wrap sm:flex-nowrap gap-1.5 justify-center">
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
                e.currentTarget.style.backgroundColor = "";
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
