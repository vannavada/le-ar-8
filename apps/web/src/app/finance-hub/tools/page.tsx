import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Calculators",
  description:
    "Free financial calculators — FIRE planning, real returns, and cross-border US–India money tools for NRIs. No ads, no sign-up, runs in your browser.",
};

const ACCENT = "#5f9e7e";

type Calculator = {
  slug: string;
  title: string;
  description: string;
  tag: string;
  fx: boolean;
  regulatory: boolean;
};

type Category = {
  name: string;
  tagline: string;
  prominent?: boolean;
  calculators: Calculator[];
};

const CATEGORIES: Category[] = [
  {
    name: "Planning & Everyday",
    tagline:
      "Core financial math — FIRE numbers, real returns, and the hidden cost of everyday money decisions.",
    calculators: [
      {
        slug: "time-to-fi",
        title: "Time to Financial Independence",
        description:
          "Real FIRE math: how long until your portfolio sustains your lifestyle indefinitely? Savings rate is the lever.",
        tag: "FIRE",
        fx: false,
        regulatory: false,
      },
      {
        slug: "coast-fire",
        title: "Coast-FIRE Number",
        description:
          "Have you already saved enough to stop contributing? Find your coast number — the point where compounding does the rest.",
        tag: "FIRE",
        fx: false,
        regulatory: false,
      },
      {
        slug: "real-return",
        title: "Real Return",
        description:
          "Your brokerage says 10%. After tax, after inflation — what did you actually earn in purchasing power?",
        tag: "Returns",
        fx: false,
        regulatory: false,
      },
      {
        slug: "opportunity-cost",
        title: "Opportunity Cost of a Purchase",
        description:
          "What does a one-time purchase cost in future money? Every dollar spent is a dollar that can't compound.",
        tag: "Purchases",
        fx: false,
        regulatory: false,
      },
      {
        slug: "lifestyle-inflation",
        title: "Lifestyle Inflation",
        description:
          "See how much of your raise quietly disappears into a higher lifestyle — and what it costs compounded over time.",
        tag: "Raises & spending",
        fx: false,
        regulatory: false,
      },
      {
        slug: "subscription-cost",
        title: "True Cost of a Subscription",
        description:
          "$15/month feels small. Compounded over decades against what you could have earned, it isn't.",
        tag: "Subscriptions",
        fx: false,
        regulatory: false,
      },
      {
        slug: "salary-negotiation",
        title: "Lifetime Value of a Raise",
        description:
          "A raise compounds across your entire career via higher future raises. That negotiation conversation is worth far more than the first-year number.",
        tag: "Career",
        fx: false,
        regulatory: false,
      },
    ],
  },
  {
    name: "Cross-Border (US–India)",
    tagline:
      "Money decisions that span two countries — accounting for live exchange rates, INR trends, and repatriation friction. These tools exist nowhere else.",
    prominent: true,
    calculators: [
      {
        slug: "money-location",
        title: "US vs. India — Where Should My Money Live?",
        description:
          "Compare your savings in a US investment vs. Indian FD, after FX, INR trend, and tax. Live exchange rate.",
        tag: "Cross-border",
        fx: true,
        regulatory: false,
      },
      {
        slug: "crossborder-property",
        title: "Buy Property in India vs. Invest in the US",
        description:
          "Appreciation + rental income vs. US market returns — accounting for repatriation friction and current exchange rates.",
        tag: "Cross-border",
        fx: true,
        regulatory: false,
      },
      {
        slug: "moving-back",
        title: "Cost of Moving Back to India",
        description:
          "What is your US salary or savings worth in India? Current exchange rate + cost-of-living adjustment = real purchasing power.",
        tag: "Cross-border",
        fx: true,
        regulatory: false,
      },
    ],
  },
  {
    name: "NRI Tax & Regulatory",
    tagline:
      "Tax rules and limits for US–India money flows. Estimates only — verify with a tax advisor before acting.",
    calculators: [
      {
        slug: "nri-repatriation",
        title: "NRI Repatriation Calculator",
        description:
          "Estimate how much of your Indian income or asset-sale proceeds you can repatriate to the US after Indian taxes, vs. the RBI's USD 1M/year NRO limit. Estimate only — not tax advice.",
        tag: "Regulatory",
        fx: true,
        regulatory: true,
      },
      {
        slug: "gift-remittance",
        title: "Gift & Remittance Limits",
        description:
          "US→India transfers: annual exclusion ($18K), lifetime exemption ($13.6M, halves in 2026?), and whether the Indian recipient owes income tax. Thresholds change yearly.",
        tag: "Regulatory",
        fx: true,
        regulatory: true,
      },
      {
        slug: "dual-tax-residency",
        title: "Dual-Tax-Residency Estimator",
        description:
          "Rough ballpark: US and India tax on income in both countries, and whether the Foreign Tax Credit likely prevents double-taxation. Deliberately rough — not a tax computation.",
        tag: "Regulatory",
        fx: true,
        regulatory: true,
      },
    ],
  },
];

function CalculatorCard({ calc }: { calc: Calculator }) {
  return (
    <li>
      <Link
        href={`/finance-hub/tools/${calc.slug}`}
        className="group flex flex-col h-full rounded-xl border border-border/50 bg-card shadow-sm p-5 hover:border-[#5f9e7e]/40 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-[#5f9e7e] transition-colors">
            {calc.title}
          </h3>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
            >
              {calc.tag}
            </span>
            {calc.fx && !calc.regulatory && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Live FX
              </span>
            )}
            {calc.regulatory && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                ⚠ Tax rules
              </span>
            )}
          </div>
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
  );
}

export default function CalculatorsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/finance-hub" className="hover:underline">
          FinanceHub
        </Link>
        <span className="mx-1.5 opacity-50">›</span>
        <span>Calculators</span>
      </nav>

      <div className="mb-10">
        <h2 className="text-2xl font-serif font-normal" style={{ color: ACCENT }}>
          Financial Calculators
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Tools for thinking clearly about money. Cross-border calculators use live ECB exchange rates.
          Regulatory calculators (marked ⚠) encode tax/legal rules — verify before relying on them.
          No ads, no email, no database — every calculation runs in your browser.
        </p>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((category) =>
          category.prominent ? (
            <section
              key={category.name}
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: `${ACCENT}50`,
                backgroundColor: `${ACCENT}08`,
              }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: ACCENT }}
                  >
                    {category.name}
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
                  >
                    Unique to le-ar-8
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {category.tagline}
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {category.calculators.map((calc) => (
                  <CalculatorCard key={calc.slug} calc={calc} />
                ))}
              </ul>
            </section>
          ) : (
            <section key={category.name}>
              <div className="mb-5">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: ACCENT }}
                >
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {category.tagline}
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {category.calculators.map((calc) => (
                  <CalculatorCard key={calc.slug} calc={calc} />
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </div>
  );
}
