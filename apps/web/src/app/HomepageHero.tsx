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
    for (const word of words) {
      for (const kw of keywords) {
        if (word === kw || word.startsWith(kw) || kw.startsWith(word)) {
          scores[hub]++;
        }
      }
    }
  }

  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return best && best[1] > 0 ? best[0] : null;
}

// rgba helper for chip accent tints
function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// ── component ──────────────────────────────────────────────────────────────

interface Props {
  /** href of a random published article, or null if no content exists yet */
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
      if (match) {
        router.push(match.href);
        return;
      }
    }
    // No match — show inline hint instead of scrolling to a removed section
    setNoMatch(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (noMatch) setNoMatch(false);
  }

  return (
    <section className="flex items-center justify-center min-h-[82vh] px-4 sm:px-8">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* Headline — dominant serif anchor, responsive from 4 rem → 7 rem */}
        <h1
          className="font-serif font-normal text-foreground tracking-tight"
          style={{ fontSize: "clamp(4rem, 8vw + 0.5rem, 7rem)", lineHeight: 1.05 }}
        >
          What are you in the mood for?
        </h1>

        {/* Intent field — larger, with in-field submit affordance */}
        <div className="relative mt-10">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Try 'mortgages for NRIs' or 'best mechanical keyboard'…"
            className={cn(
              "w-full rounded-xl border border-border bg-background",
              "px-6 py-5 pr-16 text-lg text-foreground",
              "placeholder:text-muted-foreground/50",
              "transition-[border-color] duration-200 ease-in-out",
              "focus:outline-none focus:border-primary",
              "dark:bg-muted/20",
            )}
          />
          {/* Submit affordance — always visible, accent-colored, clickable */}
          <button
            onClick={submit}
            aria-label="Submit"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "flex h-10 w-10 items-center justify-center rounded-lg",
              "text-base transition-colors duration-150",
              "text-primary hover:bg-muted focus:outline-none",
            )}
          >
            {/* Enter-key return arrow */}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              <path d="M17 5v6a2 2 0 0 1-2 2H4" />
              <path d="M7 16l-4-4 4-4" />
            </svg>
          </button>
        </div>

        {/* No-match inline hint */}
        {noMatch && (
          <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
            Nothing obvious — try a hub chip below, or rephrase with simpler words.
          </p>
        )}

        {/* Hub chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.slug}
              onClick={() => router.push(s.href)}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-transform duration-150 hover:scale-[1.03]"
              style={{ color: s.color, borderColor: rgba(s.color, 0.3) }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = rgba(s.color, 0.08);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* "Cast me adrift" — hidden when no published content exists */}
        {randomHref !== null && (
          <div className="mt-5">
            <button
              onClick={() => router.push(randomHref!)}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Cast me adrift
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
