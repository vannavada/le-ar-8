import { ArticleDetail } from "@/components/articles/ArticleDetail";

type Props = { params: Promise<{ slug: string }> };

export default async function FinanceHubArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetail hub="FINANCE_HUB" slug={slug} />;
}
