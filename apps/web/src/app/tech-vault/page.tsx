import Link from "next/link";
import { TechVaultList } from "./TechVaultList";

export default function TechVaultPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">TechVault</h1>
          <p className="mt-2 text-gray-600">Product reviews and showcases</p>
        </div>
        <Link
          href="/tech-vault/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
        >
          New review
        </Link>
      </div>
      <TechVaultList />
    </div>
  );
}
