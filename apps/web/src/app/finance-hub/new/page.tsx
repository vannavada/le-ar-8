import { requireEditor } from "@/lib/require-editor";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

export const metadata = { title: "New article · FinanceHub" };

export default async function FinanceHubNewPage() {
  await requireEditor();
  return <ArticleEditor hub="FINANCE_HUB" />;
}
