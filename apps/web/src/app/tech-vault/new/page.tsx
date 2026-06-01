import { requireEditor } from "@/lib/require-editor";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

export const metadata = { title: "New article · TechVault" };

export default async function TechVaultNewPage() {
  await requireEditor();
  return <ArticleEditor hub="TECH_VAULT" />;
}
