"use client";

import Link from "next/link";
import { trpc } from "@/trpc";

export function TechVaultList() {
  const { data, isLoading, error } = trpc.techVault.list.useQuery(
    { published: true, limit: 20 },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) return <div className="mt-8 text-gray-500">Loading reviews…</div>;
  if (error) return <div className="mt-8 text-red-600">Failed to load: {error.message}</div>;
  if (!data?.length) return <div className="mt-8 text-gray-500">No reviews yet.</div>;

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((review) => (
        <li key={review.id}>
          <Link
            href={`/tech-vault/${review.slug}`}
            className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
          >
            {review.imageUrl && (
              <img
                src={review.imageUrl}
                alt=""
                className="w-full h-40 object-cover rounded-md"
              />
            )}
            <h2 className="mt-2 font-semibold text-gray-900">{review.title}</h2>
            <p className="text-sm text-gray-500">{review.productName}</p>
            <p className="mt-1 text-primary-600">★ {review.rating}/5</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
