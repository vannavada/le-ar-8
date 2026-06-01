import { ArticleDetail } from "@/components/articles/ArticleDetail";

type Props = { params: Promise<{ slug: string }> };

export default async function ThoughtForgeArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetail hub="THOUGHT_FORGE" slug={slug} />;
}
