import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";

// Reads the next-auth JWT directly from the request cookies — reliable in
// Next.js 14 App Router where getServerSession may not forward cookies.
export async function requireEditor() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = await getToken({
    req: {
      headers: { cookie: cookieHeader },
      cookies: Object.fromEntries(
        cookieStore.getAll().map((c) => [c.name, c.value])
      ),
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) redirect("/auth/signin");

  const role = token.role as string | undefined;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/");

  return token;
}
