import Link from "next/link";
import type { Hub } from "@content-platform/database";
import { hubToRoute, hubColor } from "@/lib/hub-utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ArticleCardProps {
  article: {
    id: string;
    hub: Hub;
    title: string;
    slug: string;
    summary: string | null;
    publishedAt: Date | null;
    productName: string | null;
    rating: number | null;
    author: { name: string | null };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const href = `/${hubToRoute(article.hub)}/${article.slug}`;
  const accentColor = hubColor(article.hub);

  return (
    <Link href={href} className="group block h-full">
      <Card
        className="h-full transition-shadow hover:shadow-md border-l-[3px]"
        style={{ borderLeftColor: accentColor }}
      >
        <CardHeader>
          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {article.productName && article.rating != null && (
              <span>{article.productName} · {"★".repeat(article.rating)} · </span>
            )}
            {article.summary ??
              (article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString()
                : "Draft")}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
