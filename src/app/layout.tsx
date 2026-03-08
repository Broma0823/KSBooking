import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KS Choir Booking",
  description:
    "Book a professional choir for weddings, corporate events, funerals, and special occasions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight">
                  KS Choir
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Booking
                </span>
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-zinc-700">
                <Link href="/" className="hover:text-zinc-950">
                  Home
                </Link>
                <Link href="/about" className="hover:text-zinc-950">
                  About
                </Link>
                <Link href="/repertoire" className="hover:text-zinc-950">
                  Repertoire & Services
                </Link>
                <Link href="/media" className="hover:text-zinc-950">
                  Media
                </Link>
                <Link href="/faq-contact" className="hover:text-zinc-950">
                  FAQ & Contact
                </Link>
                <Link
                  href="/book"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
                >
                  Book the Choir
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <footer className="border-t border-zinc-200 bg-white/80">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-zinc-500 sm:flex-row">
              <p>© {new Date().getFullYear()} KS Choir. All rights reserved.</p>
              <p className="text-[11px]">
                Available for weddings, corporate events, funerals, and special
                occasions.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
