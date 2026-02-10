import { notFound } from "next/navigation";
import { TechVaultDetail } from "./TechVaultDetail";

type Props = { params: Promise<{ slug: string }> };

export default async function TechVaultReviewPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div>
      <TechVaultDetail slug={slug} />
    </div>
  );
}
