"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Hub } from "@content-platform/database";
import { trpc } from "@/trpc";
import { ArticleBody } from "./ArticleBody";
import { hubToRoute } from "@/lib/hub-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildAffiliateUrl } from "@/lib/affiliate";

export interface EditingArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  tags: string[];
  published: boolean;
  rating: number | null;
  productName: string | null;
  productCategory: string | null;
}

interface ArticleEditorProps {
  hub: Hub;
  article?: EditingArticle;
}

const HUB_LABELS: Record<Hub, string> = {
  TECH_VAULT: "TechVault",
  THOUGHT_FORGE: "ThoughtForge",
  FINANCE_HUB: "FinanceHub",
  LEARN_HUB: "LearnHub",
};

const fieldClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function ArticleEditor({ hub, article }: ArticleEditorProps) {
  const isEditing = !!article;
  const router = useRouter();

  // ── form state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(isEditing);
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [tags, setTags] = useState((article?.tags ?? []).join(", "));
  const [published, setPublished] = useState(article?.published ?? false);

  // review fields — TECH_VAULT only
  const [isReview, setIsReview] = useState(
    hub === "TECH_VAULT" && (!!article?.productName || article?.rating != null)
  );
  const [rating, setRating] = useState(article?.rating ?? 5);
  const [productName, setProductName] = useState(article?.productName ?? "");
  const [productCategory, setProductCategory] = useState(article?.productCategory ?? "");

  // ── UI state ────────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Affiliate link helper ────────────────────────────────────────────────
  const [showAffiliateHelper, setShowAffiliateHelper] = useState(false);
  const [affiliateInput, setAffiliateInput] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");

  const { data: affiliatePrograms } = trpc.affiliate.listActive.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const amazonProgram = affiliatePrograms?.find((p) => p.network === "amazon");

  function handleGenerateLink() {
    if (!amazonProgram || !affiliateInput.trim()) return;
    setGeneratedLink(buildAffiliateUrl(amazonProgram, affiliateInput.trim()));
    setCopyLabel("Copy");
  }

  async function handleCopyLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 2000);
  }

  // computed slug — auto-follows title unless user has edited the slug field
  const computedSlug = slug || slugify(title);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugLocked) setSlug("");
  }

  function handleSlugChange(val: string) {
    setSlug(val);
    setSlugLocked(true);
  }

  function validate(): boolean {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Title is required.");
    const finalSlug = computedSlug;
    if (!finalSlug) errs.push("Slug is required.");
    else if (!/^[a-z0-9-]+$/.test(finalSlug))
      errs.push("Slug: lowercase letters, numbers, and hyphens only.");
    if (!body.trim()) errs.push("Body is required.");
    if (hub === "TECH_VAULT" && isReview && !productName.trim())
      errs.push("Product name is required for reviews.");
    setErrors(errs);
    return errs.length === 0;
  }

  // ── mutations ───────────────────────────────────────────────────────────
  const create = trpc.article.create.useMutation({
    onSuccess: (data) => router.push(`/${hubToRoute(hub)}/${data.slug}`),
    onError: (e) => setErrors([e.message]),
  });

  const update = trpc.article.update.useMutation({
    onSuccess: (data) => router.push(`/${hubToRoute(hub)}/${data.slug}`),
    onError: (e) => setErrors([e.message]),
  });

  const del = trpc.article.delete.useMutation({
    onSuccess: () => router.push(`/${hubToRoute(hub)}`),
    onError: (e) => setErrors([e.message]),
  });

  const isPending = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const finalSlug = computedSlug;
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const reviewFields =
      hub === "TECH_VAULT" && isReview
        ? {
            rating,
            productName: productName.trim() || undefined,
            productCategory: productCategory.trim() || undefined,
          }
        : { rating: null, productName: null, productCategory: null };

    if (isEditing) {
      update.mutate({
        id: article!.id,
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim() || null,
        body: body.trim(),
        tags: parsedTags,
        published,
        ...reviewFields,
      });
    } else {
      create.mutate({
        hub,
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim() || undefined,
        body: body.trim(),
        tags: parsedTags,
        published,
        ...(hub === "TECH_VAULT" && isReview
          ? {
              rating,
              productName: productName.trim() || undefined,
              productCategory: productCategory.trim() || undefined,
            }
          : {}),
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing
          ? `Edit — ${article!.title}`
          : `New article · ${HUB_LABELS[hub]}`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Metadata ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={fieldClass}
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Slug{" "}
              {!slugLocked && (
                <span className="text-xs text-muted-foreground font-normal">(auto-generated)</span>
              )}
            </label>
            <input
              value={computedSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={cn(fieldClass, "font-mono text-xs")}
              placeholder="article-slug"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              Summary{" "}
              <span className="text-muted-foreground font-normal text-xs">(optional — shown on list cards)</span>
            </label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className={fieldClass}
              placeholder="One sentence that hooks the reader"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Tags{" "}
              <span className="text-muted-foreground font-normal text-xs">(comma-separated)</span>
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={fieldClass}
              placeholder="tech, keyboards, review"
            />
          </div>

          <div className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="published" className="text-sm font-medium select-none">
              Published
            </label>
            <span className="text-xs text-muted-foreground">
              {published ? "Visible to all readers" : "Draft — only editors can see it"}
            </span>
          </div>
        </div>

        {/* ── TechVault review fields ──────────────────────────────────────── */}
        {hub === "TECH_VAULT" && (
          <div className="rounded-md border border-border bg-card/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isReview"
                checked={isReview}
                onChange={(e) => setIsReview(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <label htmlFor="isReview" className="text-sm font-medium select-none">
                This is a product review (adds rating, product fields)
              </label>
            </div>
            {isReview && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-sm font-medium">Product name</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={fieldClass}
                    placeholder="Keychron K2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className={fieldClass}
                    placeholder="Keyboards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Rating (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Split pane: Markdown editor + live preview ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Body{" "}
              <span className="text-xs text-muted-foreground font-normal">Markdown</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={cn(fieldClass, "font-mono text-xs leading-relaxed resize-none")}
              style={{ minHeight: "520px" }}
              placeholder={"## Heading\n\nWrite in **Markdown**…\n\n- list item\n- another item"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-muted-foreground">
              Preview{" "}
              <span className="text-xs font-normal">(matches published output)</span>
            </div>
            <div
              className="rounded-md border border-border bg-card p-4 overflow-y-auto"
              style={{ minHeight: "520px" }}
            >
              {body.trim() ? (
                <ArticleBody body={body} affiliatePrograms={affiliatePrograms ?? []} />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Preview appears as you write…
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Affiliate link helper ────────────────────────────────────────── */}
        <div className="rounded-md border border-border bg-card/50 p-4">
          <button
            type="button"
            onClick={() => setShowAffiliateHelper((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium w-full text-left"
          >
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "hsl(var(--affiliate))" }}
            />
            Affiliate link helper
            <span className="text-xs text-muted-foreground font-normal ml-1">
              (generates tag from DB — tag is never hardcoded here)
            </span>
            <span className="ml-auto text-muted-foreground text-xs">
              {showAffiliateHelper ? "▲" : "▼"}
            </span>
          </button>

          {showAffiliateHelper && (
            <div className="mt-4 space-y-3">
              {/* Inline link generator */}
              <div>
                <p className="text-xs font-medium mb-1.5">Generate an affiliate link</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">
                      Amazon ASIN (e.g. B08N5KWB9H) or full URL
                    </label>
                    <input
                      value={affiliateInput}
                      onChange={(e) => setAffiliateInput(e.target.value)}
                      className={cn(fieldClass, "font-mono text-xs")}
                      placeholder="B08N5KWB9H"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateLink}
                    disabled={!amazonProgram || !affiliateInput.trim()}
                  >
                    Generate
                  </Button>
                </div>

                {generatedLink && (
                  <div className="mt-2 flex gap-2 items-center">
                    <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate">
                      {generatedLink}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      {copyLabel}
                    </button>
                  </div>
                )}

                {!amazonProgram && affiliatePrograms !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No active Amazon affiliate program found in the database.
                  </p>
                )}
              </div>

              {/* ProductCard snippet guide */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium mb-1.5">Drop a ProductCard into the body</p>
                <pre className="text-xs bg-muted rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">{`\`\`\`product-card
asin: B08N5KWB9H
title: Sony WH-1000XM5
blurb: Best noise cancellation on the market.
price: $349
\`\`\``}</pre>
                <p className="text-xs text-muted-foreground mt-1.5">
                  The affiliate tag is looked up from the database at render time — never stored in the body.
                </p>
              </div>

              {/* NestMarginCTA snippet guide */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium mb-1.5">Drop the nestmargin CTA into the body</p>
                <pre className="text-xs bg-muted rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">{`\`\`\`nestmargin-cta
\`\`\``}</pre>
              </div>
            </div>
          )}
        </div>

        {/* ── Validation errors ────────────────────────────────────────────── */}
        {errors.length > 0 && (
          <ul className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-destructive">
                {err}
              </li>
            ))}
          </ul>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 pt-1">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : isEditing ? "Save changes" : "Create article"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>

        {/* ── Delete (edit mode only) ───────────────────────────────────────── */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-border">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-destructive hover:underline"
              >
                Delete this article…
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-destructive">
                  Permanently delete &ldquo;{title}&rdquo;? This cannot be undone.
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={del.isPending}
                  onClick={() => del.mutate({ id: article!.id })}
                >
                  {del.isPending ? "Deleting…" : "Yes, delete"}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
