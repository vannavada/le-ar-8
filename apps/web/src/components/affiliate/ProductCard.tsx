import Image from "next/image";

interface ProductCardProps {
  title: string;
  blurb?: string;
  price?: string;
  imageUrl?: string;
  affiliateUrl: string;
}

export function ProductCard({ title, blurb, price, imageUrl, affiliateUrl }: ProductCardProps) {
  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card overflow-hidden flex flex-col sm:flex-row">
      {imageUrl && (
        <div className="relative w-full sm:w-40 h-40 flex-shrink-0 bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col justify-between p-4 gap-3 flex-1">
        <div>
          <p className="font-semibold text-sm leading-snug">{title}</p>
          {price && (
            <p className="text-sm text-muted-foreground mt-0.5">{price}</p>
          )}
          {blurb && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{blurb}</p>
          )}
        </div>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors self-start"
          style={{ backgroundColor: "hsl(var(--affiliate))" }}
        >
          View on Amazon →
        </a>
      </div>
    </div>
  );
}
