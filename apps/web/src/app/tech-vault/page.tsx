import Link from "next/link";
import { TechVaultList } from "./TechVaultList";
import { Button } from "@/components/ui/button";

export default function TechVaultPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Link href="/tech-vault/new">
          <Button size="sm">New review</Button>
        </Link>
      </div>
      <TechVaultList />
    </div>
  );
}
