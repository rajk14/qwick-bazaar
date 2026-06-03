import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qwick Bazaar Catalog",
  description: "Quick-commerce grocery catalog for Qwick Bazaar"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf text-lg font-black text-white">
                QB
              </span>
              <span>
                <span className="block text-base font-black leading-5">Qwick Bazaar</span>
                <span className="block text-xs font-medium text-black/50">Groceries in minutes</span>
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-bold">
              <Link className="rounded-full px-4 py-2 text-black/70 hover:bg-black/[0.04]" href="/">
                Shop
              </Link>
              <Link className="rounded-full px-4 py-2 text-black/70 hover:bg-black/[0.04]" href="/admin/catalog">
                Admin
              </Link>
              <Link className="rounded-full bg-ink px-4 py-2 text-white" href="/cart">
                Cart
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
