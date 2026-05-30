"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const fieldClass = cn(
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
);

export default function NewReviewPage() {
  const router = useRouter();
  const create = trpc.techVault.create.useMutation({
    onSuccess: (data) => router.push(`/tech-vault/${data.slug}`),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
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
      <form
        onSubmit={handleSubmit((data) => {
          create.mutate({
            ...data,
            slug: data.slug || slugFromTitle,
            imageUrl: data.imageUrl || undefined,
          });
        })}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input {...register("title")} className={fieldClass} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            {...register("slug")}
            value={watch("slug") || slugFromTitle}
            onChange={(e) => setValue("slug", e.target.value)}
            className={fieldClass}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Product name</label>
          <input {...register("productName")} className={fieldClass} />
          {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select {...register("category")} className={fieldClass}>
            <option value="TECHNOLOGY">Technology</option>
            <option value="MENS_LIFESTYLE">Men&apos;s lifestyle</option>
            <option value="AUTOMOTIVE">Automotive</option>
            <option value="INNOVATION">Innovation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            {...register("rating", { valueAsNumber: true })}
            className={fieldClass}
          />
          {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Summary (optional)</label>
          <input {...register("summary")} className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium">Body</label>
          <textarea {...register("body")} rows={8} className={fieldClass} />
          {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Image URL (optional)</label>
          <input {...register("imageUrl")} className={fieldClass} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("published")} id="published" className="rounded border-border" />
          <label htmlFor="published" className="text-sm">Publish immediately</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create review"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
        {create.error && <p className="text-xs text-red-500">{create.error.message}</p>}
      </form>
    </div>
  );
}
