import { requireEditor } from "@/lib/require-editor";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

export const metadata = { title: "New article · LearnHub" };

export default async function LearnHubNewPage() {
  await requireEditor();
  return <ArticleEditor hub="LEARN_HUB" />;
}
