export function CtaSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-6xl">
        <div
          className="rounded-2xl border border-[#3E5E63] p-10 sm:p-14 text-center"
          style={{
            background:
              "linear-gradient(135deg, #214C54 0%, #1a3e47 50%, #214C54 100%)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4E8770] mb-4">
            Tham gia The1ight
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FDF5DA] leading-tight">
            Bạn muốn tạo sản phẩm như thế này?
          </h2>
          <p className="mt-4 text-[#F0F0F0]/60 max-w-xl mx-auto text-base leading-relaxed">
            Học cách dùng AI để build sản phẩm thực tế — từ ý tưởng đến deploy — trong chương trình live class của The1ight.
          </p>
          <a
            href="https://the1ight.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFD94C] px-8 py-3.5 text-sm font-bold text-[#15333B] transition-opacity hover:opacity-90"
          >
            Tìm hiểu thêm tại The1ight ↗
          </a>
        </div>
      </div>
    </section>
  );
}
