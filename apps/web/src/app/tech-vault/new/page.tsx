"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/trpc";

const schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens"),
  summary: z.string().max(500).optional(),
  body: z.string().min(1),
  rating: z.number().min(1).max(5),
  productName: z.string().min(1).max(200),
  category: z.enum(["TECHNOLOGY", "MENS_LIFESTYLE", "AUTOMOTIVE", "INNOVATION"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewReviewPage() {
  const router = useRouter();
  const create = trpc.techVault.create.useMutation({
    onSuccess: (data) => {
      router.push(`/tech-vault/${data.slug}`);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, published: false, slug: "" },
  });

  const title = watch("title");
  const slugFromTitle = title
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") ?? "";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-700">New review</h1>
      <p className="mt-1 text-gray-500">You must be signed in to create a review.</p>

      <form
        onSubmit={handleSubmit((data) => {
          const slug =
            data.slug ||
            (data.title ?? "")
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
          create.mutate({
            ...data,
            slug,
            imageUrl: data.imageUrl || undefined,
          });
        })}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register("title")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            {...register("slug")}
            value={watch("slug") || slugFromTitle}
            onChange={(e) => setValue("slug", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product name</label>
          <input
            {...register("productName")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register("category")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="TECHNOLOGY">Technology</option>
            <option value="MENS_LIFESTYLE">Men&apos;s lifestyle</option>
            <option value="AUTOMOTIVE">Automotive</option>
            <option value="INNOVATION">Innovation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            {...register("rating", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Summary (optional)</label>
          <input
            {...register("summary")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Body</label>
          <textarea
            {...register("body")}
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
          <input
            {...register("imageUrl")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("published")}
            id="published"
            className="rounded border-gray-300"
          />
          <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={create.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create review"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        {create.error && (
          <p className="text-sm text-red-600">{create.error.message}</p>
        )}
      </form>
    </div>
  );
}
