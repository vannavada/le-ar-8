import Link from "next/link";
import { SECTIONS } from "@/lib/sections";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Tech reviews.
            <br />
            <span className="text-primary">Deep reads. Financial clarity.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            One writer. Six sections. Honest takes on technology, money,
            and everything in between.
          </p>
        </div>
      </section>

      {/* Sections grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-center mb-10">
            Browse the sections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECTIONS.map((section) => (
              <Link key={section.slug} href={section.href} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3"
                      style={{ backgroundColor: section.color }}
                    >
                      {section.name[0]}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-lg">
                      {section.name}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
