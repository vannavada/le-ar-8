"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { ProductCard } from "@/components/affiliate/ProductCard";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { buildAffiliateUrl, parseKeyValueBlock, type AffiliateProgramMeta } from "@/lib/affiliate";

interface ArticleBodyProps {
  body: string;
  affiliatePrograms?: AffiliateProgramMeta[];
}

function isAffiliateHref(href: string): boolean {
  try {
    const url = new URL(href);
    return (
      (url.hostname.includes("amazon.com") && url.searchParams.has("tag")) ||
      url.hostname.includes("amzn.to")
    );
  } catch {
    return false;
  }
}

const CUSTOM_FENCE_LANGUAGES = new Set(["product-card", "nestmargin-cta"]);

export function ArticleBody({ body, affiliatePrograms = [] }: ArticleBodyProps) {
  const amazonProgram = affiliatePrograms.find((p) => p.network === "amazon");

  const components: Components = {
    // Remove the <pre> wrapper for custom fence types — the prose pre styles
    // (overflow-x: auto, code background) create a scroll container that captures
    // pointer events and clips block-level components like NestMarginCTA.
    // Regular code blocks still get <pre>; custom ones render their children directly.
    pre({ children }) {
      const child = React.isValidElement(children)
        ? (children as React.ReactElement<{ className?: string }>)
        : null;
      const language = child?.props?.className?.replace("language-", "") ?? "";
      if (CUSTOM_FENCE_LANGUAGES.has(language)) {
        return <>{children}</>;
      }
      return <pre>{children}</pre>;
    },

    // Custom code block rendering for product-card and nestmargin-cta fences
    code({ className, children }) {
      const language = className?.replace("language-", "") ?? "";
      const content = String(children).trim();

      if (language === "nestmargin-cta") {
        return <NestMarginCTA />;
      }

      if (language === "product-card") {
        const fields = parseKeyValueBlock(content);
        const asinOrUrl = fields.asin ?? fields.url ?? "";
        const affiliateUrl = amazonProgram
          ? buildAffiliateUrl(amazonProgram, asinOrUrl)
          : `https://www.amazon.com/s?k=${encodeURIComponent(fields.title ?? "")}`;

        return (
          <ProductCard
            title={fields.title ?? ""}
            blurb={fields.blurb}
            price={fields.price}
            imageUrl={fields.image}
            affiliateUrl={affiliateUrl}
          />
        );
      }

      return (
        <code className={className}>{children}</code>
      );
    },

    // Style affiliate links in magenta; leave all other links as-is
    a({ href, children, ...props }) {
      const isAffiliate = href ? isAffiliateHref(href) : false;
      return (
        <a
          href={href}
          {...props}
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
          style={isAffiliate ? { color: "hsl(var(--affiliate))" } : undefined}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
