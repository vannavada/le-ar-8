import { requireEditor } from "@/lib/require-editor";
import { prisma } from "@content-platform/database";
import { createNowPageRepository } from "@/repositories/now-page";
import { NowEditor } from "@/components/now/NowEditor";

export const metadata = { title: "Edit Now" };

export default async function NowEditPage() {
  await requireEditor();
  const row = await createNowPageRepository(prisma).get();
  return <NowEditor initialBody={row?.body ?? ""} />;
}
