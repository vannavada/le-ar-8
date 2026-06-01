export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { prisma } from "@content-platform/database";
import { createNowPageRepository } from "@/repositories/now-page";
import { ArticleBody } from "@/components/articles/ArticleBody";

export const metadata = { title: "Now" };

export default async function NowPage() {
  const [row, session] = await Promise.all([
    createNowPageRepository(prisma).get(),
    getServerSession(authOptions),
  ]);

  const isEditor =
    session?.user?.role === "EDITOR" || session?.user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-foreground">Now</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What I&apos;m focused on right now.{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              What is a /now page?
            </a>
          </p>
          {row && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last updated {new Date(row.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {isEditor && (
          <Link
            href="/now/edit"
            className="shrink-0 text-xs text-primary hover:underline"
          >
            Edit
          </Link>
        )}
      </div>

      {row ? (
        <ArticleBody body={row.body} />
      ) : (
        <p className="text-muted-foreground italic">
          Nothing here yet — check back soon.
        </p>
      )}
    </div>
  );
}
