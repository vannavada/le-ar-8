interface AffiliateDisclosureProps {
  className?: string;
}

export function AffiliateDisclosure({ className }: AffiliateDisclosureProps) {
  return (
    <p
      className={
        "text-xs text-muted-foreground border-b border-border pb-3 mb-6" +
        (className ? ` ${className}` : "")
      }
    >
      <strong className="font-medium">Disclosure:</strong> This article contains
      affiliate links. If you purchase through them, I may earn a small commission
      at no extra cost to you. I only recommend products I&apos;ve evaluated or
      genuinely stand behind.
    </p>
  );
}
