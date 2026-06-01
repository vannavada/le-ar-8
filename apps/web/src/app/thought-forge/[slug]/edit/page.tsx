import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/require-editor";
import { prisma } from "@content-platform/database";
import { createArticleRepository } from "@/repositories/article";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function ThoughtForgeEditPage({ params }: Props) {
  await requireEditor();
  const { slug } = await params;
  const article = await createArticleRepository(prisma).getBySlug("THOUGHT_FORGE", slug);
  if (!article) notFound();
  return (
    <ArticleEditor
      hub="THOUGHT_FORGE"
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        body: article.body,
        tags: article.tags,
        published: article.published,
        rating: article.rating,
        productName: article.productName,
        productCategory: article.productCategory,
      }}
    />
  );
}
