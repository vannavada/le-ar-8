import { ArticleDetail } from "@/components/articles/ArticleDetail";

type Props = { params: Promise<{ slug: string }> };

export default async function LearnHubArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetail hub="LEARN_HUB" slug={slug} />;
}
