"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Hub } from "@content-platform/database";
import { trpc } from "@/trpc";
import { hubToRoute, hubColor, hubName } from "@/lib/hub-utils";
import { hasAffiliateContent } from "@/lib/affiliate";
import { ArticleBody } from "./ArticleBody";
import { ShareButtons } from "./ShareButtons";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";

interface ArticleDetailProps {
  hub: Hub;
  slug: string;
}

export function ArticleDetail({ hub, slug }: ArticleDetailProps) {
  const { data: session } = useSession();
  const isEditor =
    session?.user?.role === "EDITOR" || session?.user?.role === "ADMIN";

  const { data, isLoading, error } = trpc.article.getBySlug.useQuery(
    { hub, slug },
    { refetchOnWindowFocus: false }
  );

  const accentColor = hubColor(hub);
  const route = hubToRoute(hub);

  // Detect affiliate content to auto-show disclosure and to decide whether to fetch programs.
  const bodyHasAffiliate = data?.body ? hasAffiliateContent(data.body) : false;
  const bodyHasProductCards = data?.body ? /```product-card/.test(data.body) : false;

  // Only fetch affiliate programs when the article actually contains product cards
  // (the tag comes from the DB at render time, never hardcoded in components).
  const { data: affiliatePrograms } = trpc.affiliate.listActive.useQuery(undefined, {
    enabled: bodyHasProductCards,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4 pt-4">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted/60 rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="mt-8 text-muted-foreground">Article not found.</p>;
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Hub label + editor affordances */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs font-medium tracking-wide uppercase"
          style={{ color: accentColor }}
        >
          {hubName(hub)}
        </span>

        {isEditor && (
          <>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <Link
              href={`/${route}/${slug}/edit`}
              className="text-xs text-primary hover:underline"
            >
              Edit
            </Link>
            {!data.published && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Draft
              </span>
            )}
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold font-serif leading-tight">{data.title}</h1>

      {data.productName && data.rating != null && (
        <p className="mt-2 text-sm text-muted-foreground">
          {data.productName} · {"★".repeat(data.rating)}
          {data.productCategory && ` · ${data.productCategory}`}
        </p>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        {data.author.name ?? "Anonymous"} ·{" "}
        {data.publishedAt
          ? new Date(data.publishedAt).toLocaleDateString()
          : "Draft"}
      </p>

      {data.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {data.summary && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {data.summary}
        </p>
      )}

      {/* FTC disclosure — auto-shown when article contains affiliate content */}
      {bodyHasAffiliate && (
        <div className="mt-6">
          <AffiliateDisclosure />
        </div>
      )}

      <div className={bodyHasAffiliate ? "mt-2" : "mt-8"}>
        <ArticleBody body={data.body} affiliatePrograms={affiliatePrograms ?? []} />
      </div>

      <ShareButtons title={data.title} hubRoute={route} slug={slug} />
    </article>
  );
}
