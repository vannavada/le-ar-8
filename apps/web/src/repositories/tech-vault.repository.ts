import type { PrismaClient, TechVaultCategory } from "@content-platform/database";

export type CreateReviewInput = {
  title: string;
  slug: string;
  summary?: string;
  body: string;
  rating: number;
  productName: string;
  category: TechVaultCategory;
  imageUrl?: string;
  published?: boolean;
  authorId: string;
};

export type UpdateReviewInput = {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  rating?: number;
  productName?: string;
  category?: TechVaultCategory;
  imageUrl?: string | null;
  published?: boolean;
};

export function createTechVaultRepository(db: PrismaClient) {
  return {
    list(args: { category?: TechVaultCategory; published?: boolean; limit?: number; offset?: number }) {
      return db.techVaultReview.findMany({
        where: {
          ...(args.category != null && { category: args.category }),
          ...(args.published != null && { published: args.published }),
        },
        orderBy: { publishedAt: "desc" },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    getBySlug(slug: string) {
      return db.techVaultReview.findUnique({
        where: { slug },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    create(data: CreateReviewInput) {
      return db.techVaultReview.create({
        data: {
          ...data,
          publishedAt: data.published ? new Date() : null,
        },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    update(id: string, data: UpdateReviewInput) {
      return db.techVaultReview.update({
        where: { id },
        data: {
          ...data,
          ...(data.published === true && { publishedAt: new Date() }),
        },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    delete(id: string) {
      return db.techVaultReview.delete({
        where: { id },
      });
    },
  };
}
