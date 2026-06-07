import type { Metadata } from "next";
import { prisma } from "@content-platform/database";
import { createArticleRepository } from "@/repositories/article";
import { ArticleDetail } from "@/components/articles/ArticleDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await createArticleRepository(prisma).getBySlug("THOUGHT_FORGE", slug);
  if (!article) return {};
  return {
    title: article.title,
    ...(article.summary && { description: article.summary }),
  };
}

export default async function ThoughtForgeArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetail hub="THOUGHT_FORGE" slug={slug} />;
}
