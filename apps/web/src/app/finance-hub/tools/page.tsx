import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Calculators | FinanceHub",
  description:
    "Free financial calculators for FIRE, salary negotiation, real returns, lifestyle inflation, and more. Pure math, no ads, no sign-up.",
};

const ACCENT = "#5f9e7e";

const CALCULATORS = [
  {
    slug: "lifestyle-inflation",
    title: "Lifestyle Inflation",
    description:
      "See how much of your raise quietly disappears into a higher lifestyle — and what it costs compounded over time.",
    tag: "Raises & spending",
  },
  {
    slug: "subscription-cost",
    title: "True Cost of a Subscription",
    description:
      "$15/month feels small. Compounded over decades against what you could have earned, it isn't.",
    tag: "Subscriptions",
  },
  {
    slug: "opportunity-cost",
    title: "Opportunity Cost of a Purchase",
    description:
      "What does a one-time purchase cost in future money? Every dollar spent is a dollar that can't compound.",
    tag: "Purchases",
  },
  {
    slug: "coast-fire",
    title: "Coast-FIRE Number",
    description:
      "Have you already saved enough to stop contributing? Find your coast number — the point where compounding does the rest.",
    tag: "FIRE",
  },
  {
    slug: "salary-negotiation",
    title: "Lifetime Value of a Raise",
    description:
      "A raise compounds across your entire career via higher future raises. That negotiation conversation is worth far more than the first-year number.",
    tag: "Career",
  },
  {
    slug: "time-to-fi",
    title: "Time to Financial Independence",
    description:
      "Real FIRE math: how long until your portfolio sustains your lifestyle indefinitely? Savings rate is the lever.",
    tag: "FIRE",
  },
  {
    slug: "real-return",
    title: "Real Return",
    description:
      "Your brokerage says 10%. After tax, after inflation — what did you actually earn in purchasing power?",
    tag: "Returns",
  },
] as const;

export default function CalculatorsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-normal" style={{ color: ACCENT }}>
          Financial Calculators
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Pure-math tools for thinking clearly about money. No ads, no email required, no database.
          Every calculation runs locally in your browser.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {CALCULATORS.map((calc) => (
          <li key={calc.slug}>
            <Link
              href={`/finance-hub/tools/${calc.slug}`}
              className="group flex flex-col h-full rounded-xl border border-border/50 bg-card shadow-sm p-5 hover:border-[#5f9e7e]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-snug group-hover:text-[#5f9e7e] transition-colors">
                  {calc.title}
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${ACCENT}18`,
                    color: ACCENT,
                  }}
                >
                  {calc.tag}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {calc.description}
              </p>
              <span
                className="mt-3 text-xs font-medium self-start"
                style={{ color: ACCENT }}
              >
                Open calculator →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
