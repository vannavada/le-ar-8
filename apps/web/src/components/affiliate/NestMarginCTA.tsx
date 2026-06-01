const NESTMARGIN_URL =
  "https://nestmargin.com/?utm_source=lear8&utm_medium=content&utm_campaign=article-cta";

export function NestMarginCTA() {
  return (
    <div className="not-prose my-8 rounded-lg border border-border/50 bg-card shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* min-w-0 lets the flex item shrink below its content width so text wraps */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">
          Track what your home is really worth
        </p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          nestmargin.com gives you a single view of your cross-border net worth —
          property values, currency exposure, and the real equity picture. Free to
          get started.
        </p>
      </div>
      <a
        href={NESTMARGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium text-white whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ backgroundColor: "hsl(var(--affiliate))" }}
      >
        Try nestmargin →
      </a>
    </div>
  );
}
