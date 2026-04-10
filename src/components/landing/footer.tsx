import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#3E5E63] bg-[#15333B] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#FFD94C] flex items-center justify-center">
            <span className="text-[#15333B] font-black text-lg leading-none">1</span>
          </div>
          <span className="text-[#FDF5DA] font-semibold text-sm">The1ight Showcase</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm text-[#F0F0F0]/60">
          <Link href="/" className="hover:text-[#FFD94C] transition-colors">
            Gallery
          </Link>
          <Link href="/results" className="hover:text-[#FFD94C] transition-colors">
            Kết quả
          </Link>
          <a
            href="https://the1ight.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FFD94C] transition-colors"
          >
            The1ight ↗
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-[#F0F0F0]/40 text-xs">
          © {new Date().getFullYear()} The1ight. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
