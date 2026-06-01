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
    // Always pass through pre children directly. The code component below
    // re-adds <pre> for regular code fences, so custom fences get no wrapper.
    // Inspecting children in `pre` to detect the language is unreliable in
    // react-markdown v10 — children can arrive as an array containing whitespace
    // text nodes, making React.isValidElement() return false and leaving the
    // prose <pre> scroll-container in place (which captures pointer events).
    pre({ children }) {
      return <>{children}</>;
    },

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

      // Block code fence (has a language- class): add back the <pre> wrapper
      // that we stripped from the `pre` override above.
      if (className) {
        return (
          <pre>
            <code className={className}>{children}</code>
          </pre>
        );
      }

      // Inline code — no wrapper needed.
      return <code>{children}</code>;
    },

    // Style affiliate links in magenta; leave all other links as-is.
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
