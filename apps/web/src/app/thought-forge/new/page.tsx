import { requireEditor } from "@/lib/require-editor";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

export const metadata = { title: "New article · ThoughtForge" };

export default async function ThoughtForgeNewPage() {
  await requireEditor();
  return <ArticleEditor hub="THOUGHT_FORGE" />;
}
