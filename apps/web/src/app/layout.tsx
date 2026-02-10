import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { SessionProvider } from "@/components/SessionProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Content Platform",
  description: "Multi-platform content and analytics hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <Providers>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
