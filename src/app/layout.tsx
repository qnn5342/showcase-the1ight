import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthButton } from "@/components/auth/AuthButton";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Showcase The1ight",
  description: "Nơi học viên The1ight trưng bày dự án vibe coding",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-[#3E5E63] bg-[#15333B]/80 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
              <Link href="/" className="text-lg font-bold hover:opacity-80 transition-opacity" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#FDF5DA" }}>
                Showcase The1ight
              </Link>
              <AuthButton />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
