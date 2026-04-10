import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Showcase The1ight",
  description: "Nơi học viên The1ight trưng bày dự án vibe coding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
