import type { PrismaClient } from "@content-platform/database";

export function createNowPageRepository(db: PrismaClient) {
  return {
    get() {
      return db.nowPage.findFirst({ orderBy: { updatedAt: "desc" } });
    },

    async upsert(body: string) {
      const existing = await db.nowPage.findFirst();
      if (existing) {
        return db.nowPage.update({ where: { id: existing.id }, data: { body } });
      }
      return db.nowPage.create({ data: { body } });
    },
  };
}
