import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <p className="font-semibold mb-1">lear8</p>
            <p className="text-sm text-muted-foreground">
              Tech reviews. Deep reads. Financial clarity.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Sections</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SECTIONS.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className="hover:text-foreground transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">More</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SECTIONS.slice(4).map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className="hover:text-foreground transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          Written with intent. Read at your own pace.
        </div>
      </div>
    </footer>
  );
}
