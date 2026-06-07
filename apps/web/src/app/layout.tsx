import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "le-ar-8 — NRI & Cross-Border Finance Tools, Reviews & Essays",
    template: "%s — le-ar-8",
  },
  description:
    "Cross-border finance tools, honest product reviews, and essays on money and tech. Written for humans, runs in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <SessionProvider>
            <Providers>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </Providers>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
