import type { PrismaClient } from "@content-platform/database";

export type CreateAffiliateProgramInput = {
  name: string;
  network: string;
  affiliateId: string;
  baseUrl: string;
  commission?: string;
  categories?: string[];
  active?: boolean;
};

export type UpdateAffiliateProgramInput = Partial<CreateAffiliateProgramInput>;

export function createAffiliateRepository(db: PrismaClient) {
  return {
    listActive() {
      return db.affiliateProgram.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      });
    },

    list() {
      return db.affiliateProgram.findMany({ orderBy: { name: "asc" } });
    },

    getById(id: string) {
      return db.affiliateProgram.findUnique({ where: { id } });
    },

    create(data: CreateAffiliateProgramInput) {
      return db.affiliateProgram.create({
        data: { ...data, categories: data.categories ?? [] },
      });
    },

    update(id: string, data: UpdateAffiliateProgramInput) {
      return db.affiliateProgram.update({ where: { id }, data });
    },
  };
}
