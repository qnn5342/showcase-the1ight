import Link from "next/link";

interface HeroSectionProps {
  studentCount: number;
  projectCount: number;
}

export function HeroSection({ studentCount, projectCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Radial gradient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(78,135,112,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Cohort badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFD94C]/30 bg-[#FFD94C]/10 px-4 py-1.5 text-sm text-[#FFD94C]">
          <span>✦</span>
          <span>Batch 3 đang diễn ra</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-black leading-tight tracking-tight text-[#FDF5DA] sm:text-5xl lg:text-6xl">
          Nơi học viên vibe code{" "}
          <span className="text-[#FFD94C]">khoe sản phẩm thật</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-[#F0F0F0]/70 max-w-2xl mx-auto leading-relaxed">
          {studentCount > 0 && projectCount > 0
            ? `${studentCount} học viên đã tạo ra ${projectCount} sản phẩm thực tế với AI. Đây là nơi họ chia sẻ hành trình đó.`
            : "Học viên The1ight dùng AI để build sản phẩm thật — và đây là nơi họ chia sẻ hành trình đó."}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#gallery"
            className="rounded-xl bg-[#FFD94C] px-7 py-3.5 text-sm font-bold text-[#15333B] transition-opacity hover:opacity-90"
          >
            Khám phá Gallery →
          </Link>
          <Link
            href="#featured"
            className="rounded-xl border border-[#3E5E63] px-7 py-3.5 text-sm font-semibold text-[#F0F0F0] transition-colors hover:border-[#FFD94C]/60 hover:text-[#FFD94C]"
          >
            Xem dự án nổi bật
          </Link>
        </div>
      </div>
    </section>
  );
}
