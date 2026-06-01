import { requireEditor } from "@/lib/require-editor";

export const metadata = { title: "Theme reference · Admin" };

// Hub accent palette — permanent internal reference for editors/admins.
// Not linked from public nav or footer. Gated to EDITOR/ADMIN.
// Update SECTIONS in src/lib/sections.ts to change the live palette;
// this page reflects whatever is currently in sections.ts.
const PALETTE = [
  {
    hub: "TechVault",
    color: "#6b9fc0",
    hsl: "204° 40% 58%",
    note: "Slate blue — technical, clean",
    phase: "active",
  },
  {
    hub: "ThoughtForge",
    color: "#c27a55",
    hsl: "20° 46% 55%",
    note: "Terracotta — editorial, warm",
    phase: "active",
  },
  {
    hub: "FinanceHub",
    color: "#5f9e7e",
    hsl: "150° 27% 49%",
    note: "Sage — calm finance",
    phase: "active",
  },
  {
    hub: "LearnHub",
    color: "#b8944a",
    hsl: "38° 43% 51%",
    note: "Ochre — warm, approachable",
    phase: "active",
  },
  {
    hub: "MindStream",
    color: "#a87898",
    hsl: "315° 24% 57%",
    note: "Mauve — reserved for Phase 2.5",
    phase: "reserved",
  },
] as const;

interface SwatchRowProps {
  hub: string;
  color: string;
  hsl: string;
  note: string;
  textBase: string;
  cardBg: string;
  borderBase: string;
  phase: string;
}

function SwatchRow({ hub, color, hsl, note, textBase, cardBg, borderBase, phase }: SwatchRowProps) {
  const tagBg = `${color}18`;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="font-serif text-xl font-normal" style={{ color }}>
          {hub}
        </span>
        {phase === "reserved" && (
          <span style={{ color: textBase, opacity: 0.4, fontSize: "11px" }}>
            Phase 2.5 — reserved
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* ArticleCard left-border accent */}
        <div
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderBase}`,
            borderLeft: `3px solid ${color}`,
            padding: "10px 14px",
            borderRadius: "6px",
            width: "180px",
          }}
        >
          <div className="font-medium text-sm" style={{ color: textBase }}>
            Sample article title
          </div>
          <div className="text-xs mt-0.5" style={{ color: textBase, opacity: 0.5 }}>
            Summary line here
          </div>
        </div>

        {/* Tag badge */}
        <span
          className="text-xs px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: tagBg, color }}
        >
          {hub.toLowerCase()}
        </span>

        {/* Values */}
        <div className="font-mono text-xs leading-tight" style={{ color: textBase, opacity: 0.55 }}>
          <div>{color}</div>
          <div>HSL {hsl}</div>
        </div>
      </div>

      <p className="text-xs" style={{ color: textBase, opacity: 0.45 }}>
        {note}
      </p>
      <div style={{ height: "1px", backgroundColor: borderBase, opacity: 0.4 }} />
    </div>
  );
}

function Panel({
  label,
  bg,
  cardBg,
  text,
  border,
}: {
  label: string;
  bg: string;
  cardBg: string;
  text: string;
  border: string;
}) {
  return (
    <div
      style={{ backgroundColor: bg, borderRadius: "12px", padding: "24px" }}
      className="space-y-5 flex-1 min-w-0"
    >
      <p
        className="font-mono text-xs tracking-wide uppercase mb-4"
        style={{ color: text, opacity: 0.4 }}
      >
        {label}
      </p>
      {PALETTE.map((s) => (
        <SwatchRow
          key={s.hub}
          hub={s.hub}
          color={s.color}
          hsl={s.hsl}
          note={s.note}
          textBase={text}
          cardBg={cardBg}
          borderBase={border}
          phase={s.phase}
        />
      ))}
    </div>
  );
}

export default async function AdminThemePage() {
  await requireEditor();

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="mb-8">
        <h1 className="font-serif text-2xl mb-1">Hub accent palette</h1>
        <p className="text-sm text-muted-foreground">
          Internal reference. Left = light mode · Right = dark mode.
          To change: update <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">src/lib/sections.ts</code>.
          Not linked from public nav or footer.
        </p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <Panel
          label="Light mode"
          bg="#ffffff"
          cardBg="#f8f8f8"
          text="#1a1a1a"
          border="#e0e0e0"
        />
        <Panel
          label="Dark mode"
          bg="#141414"
          cardBg="#1e1e1e"
          text="#f0f0f0"
          border="#2a2a2a"
        />
      </div>

      <div className="mt-8 p-4 rounded-lg border border-border bg-muted/30 space-y-1">
        <p className="text-sm font-medium">Palette summary</p>
        {PALETTE.map((s) => (
          <p key={s.hub} className="font-mono text-xs text-muted-foreground">
            {s.hub.padEnd(14)} {s.color}{"  "}HSL {s.hsl}
          </p>
        ))}
        <p className="text-xs text-muted-foreground pt-2 italic">
          All mid-luminance (~49–58% L, 24–46% S) — legible on white and near-black without a dark-mode variant.
        </p>
      </div>
    </div>
  );
}
