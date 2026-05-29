import type { PrismaClient } from "@prisma/client";
import type { TechVaultCategory } from "@prisma/client";

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

export type UpdateReviewInput = Partial<Omit<CreateReviewInput, "authorId">>;

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

    getById(id: string) {
      return db.techVaultReview.findUnique({
        where: { id },
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

    update(id: string, authorId: string, data: UpdateReviewInput) {
      return db.techVaultReview.updateMany({
        where: { id, authorId },
        data: {
          ...data,
          ...(data.published === true && { publishedAt: new Date() }),
        },
      }).then(() => db.techVaultReview.findUnique({
        where: { id },
        include: { author: { select: { id: true, name: true, image: true } } },
      }));
    },

    delete(id: string, authorId: string) {
      return db.techVaultReview.deleteMany({
        where: { id, authorId },
      });
    },
  };
}
