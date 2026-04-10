import { AnimatedCounter } from "./animated-counter";

interface StatsBarProps {
  studentCount: number;
  projectCount: number;
  awardCount: number;
}

export function StatsBar({ studentCount, projectCount, awardCount }: StatsBarProps) {
  const stats = [
    { icon: "👩‍💻", label: "Học viên", value: studentCount },
    { icon: "📦", label: "Sản phẩm", value: projectCount },
    { icon: "🏆", label: "Giải thưởng", value: awardCount },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 rounded-2xl border border-[#3E5E63] bg-[#214C54] p-6 sm:p-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              <p className="text-2xl sm:text-4xl font-black text-[#FFD94C]">
                <AnimatedCounter target={stat.value} duration={1400} />
              </p>
              <p className="text-xs sm:text-sm text-[#F0F0F0]/60 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
