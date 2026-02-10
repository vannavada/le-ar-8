import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-primary-700">Content Platform</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Tech reviews, professional discourse, financial tools, and more.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/tech-vault"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">TechVault</h2>
          <p className="mt-2 text-gray-600">Product reviews and showcases</p>
        </Link>
        <Link
          href="/thought-forge"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">ThoughtForge</h2>
          <p className="mt-2 text-gray-600">Professional discourse and articles</p>
        </Link>
        <Link
          href="/mindstream"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">MindStream</h2>
          <p className="mt-2 text-gray-600">Quick thoughts and discussions</p>
        </Link>
        <Link
          href="/finance-hub"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">FinanceHub</h2>
          <p className="mt-2 text-gray-600">Financial tools and dashboards</p>
        </Link>
        <Link
          href="/learn-hub"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">LearnHub</h2>
          <p className="mt-2 text-gray-600">Courses and learning</p>
        </Link>
        <Link
          href="/community"
          className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-primary-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-primary-600">CommunitySpace</h2>
          <p className="mt-2 text-gray-600">Topic-based discussions</p>
        </Link>
      </section>
    </div>
  );
}
