import type { PrismaClient, Hub } from "@content-platform/database";

export type CreateArticleInput = {
  hub: Hub;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  tags?: string[];
  published?: boolean;
  authorId: string;
  rating?: number;
  productName?: string;
  productCategory?: string;
};

export type UpdateArticleInput = {
  title?: string;
  slug?: string;
  summary?: string | null;
  body?: string;
  tags?: string[];
  published?: boolean;
  rating?: number | null;
  productName?: string | null;
  productCategory?: string | null;
};

export function createArticleRepository(db: PrismaClient) {
  return {
    list(args: { hub: Hub; published?: boolean; tag?: string; limit?: number; offset?: number }) {
      return db.article.findMany({
        where: {
          hub: args.hub,
          ...(args.published != null && { published: args.published }),
          ...(args.tag != null && { tags: { has: args.tag } }),
        },
        orderBy: { publishedAt: "desc" },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    getBySlug(hub: Hub, slug: string) {
      return db.article.findUnique({
        where: { hub_slug: { hub, slug } },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    getById(id: string) {
      return db.article.findUnique({
        where: { id },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    create(data: CreateArticleInput) {
      return db.article.create({
        data: {
          ...data,
          tags: data.tags ?? [],
          publishedAt: data.published ? new Date() : null,
        },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    update(id: string, authorId: string, data: UpdateArticleInput) {
      return db.article.update({
        where: { id },
        data: {
          ...data,
          ...(data.published === true && { publishedAt: new Date() }),
        },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    },

    delete(id: string, authorId: string) {
      return db.article.delete({ where: { id } });
    },

    async randomPublished() {
      const count = await db.article.count({ where: { published: true } });
      if (count === 0) return null;
      const skip = Math.floor(Math.random() * count);
      const results = await db.article.findMany({
        where: { published: true },
        select: { hub: true, slug: true },
        take: 1,
        skip,
        orderBy: { publishedAt: "desc" },
      });
      return results[0] ?? null;
    },
  };
}
