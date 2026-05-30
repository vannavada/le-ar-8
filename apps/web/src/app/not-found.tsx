import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <h1 className="text-7xl font-bold text-muted-foreground/30">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link href="/" className="mt-8">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
