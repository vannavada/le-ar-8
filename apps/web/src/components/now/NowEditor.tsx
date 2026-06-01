"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NowEditorProps {
  initialBody: string;
}

const fieldClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function NowEditor({ initialBody }: NowEditorProps) {
  const [body, setBody] = useState(initialBody);
  const router = useRouter();

  const update = trpc.nowPage.update.useMutation({
    onSuccess: () => router.push("/now"),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-6">Edit /now</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Body{" "}
            <span className="text-xs text-muted-foreground font-normal">Markdown</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn(fieldClass, "font-mono text-xs leading-relaxed resize-none")}
            style={{ minHeight: "520px" }}
            placeholder={"## Right now\n\nWhat I'm working on, thinking about, reading…"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-muted-foreground">
            Preview{" "}
            <span className="text-xs font-normal">(matches published output)</span>
          </div>
          <div
            className="rounded-md border border-border bg-card p-4 overflow-y-auto"
            style={{ minHeight: "520px" }}
          >
            {body.trim() ? (
              <ArticleBody body={body} />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Preview appears as you write…
              </p>
            )}
          </div>
        </div>
      </div>

      {update.error && (
        <p className="mt-3 text-sm text-destructive">{update.error.message}</p>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => update.mutate({ body })}
          disabled={update.isPending || !body.trim()}
        >
          {update.isPending ? "Saving…" : "Save"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/now")} disabled={update.isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
