"use client";

import { useEffect, useState } from "react";

interface ShareButtonsProps {
  title: string;
  hubRoute: string;
  slug: string;
}

export function ShareButtons({ title, hubRoute, slug }: ShareButtonsProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/${hubRoute}/${slug}`);
  }, [hubRoute, slug]);

  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  const linkClass =
    "px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors";

  return (
    <div className="mt-12 pt-6 border-t border-border">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Share</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={copy} className={linkClass}>
          {copied ? "Copied!" : "Copy link"}
        </button>
        {url && (
          <>
            <a
              href={`https://x.com/intent/tweet?url=${enc}&text=${encTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${encTitle}%20${enc}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encTitle}&body=${enc}`}
              className={linkClass}
            >
              Email
            </a>
          </>
        )}
      </div>
    </div>
  );
}
