type VoteRow = {
  category: "most_loved" | "most_creative" | "best_execution";
  project_title: string | null;
};

interface MyVotesSummaryProps {
  votes: VoteRow[];
}

const CATEGORIES: { key: VoteRow["category"]; label: string }[] = [
  { key: "most_loved", label: "Most Loved" },
  { key: "most_creative", label: "Most Creative" },
  { key: "best_execution", label: "Best Execution" },
];

export function MyVotesSummary({ votes }: MyVotesSummaryProps) {
  const votesByCategory = new Map<string, string[]>();
  for (const v of votes) {
    const titles = votesByCategory.get(v.category) ?? [];
    if (v.project_title) titles.push(v.project_title);
    votesByCategory.set(v.category, titles);
  }

  return (
    <div className="space-y-2">
      {CATEGORIES.map(({ key, label }) => {
        const titles = votesByCategory.get(key) ?? [];
        return (
          <div
            key={key}
            className="rounded-lg border border-[#3E5E63] bg-[#214C54]/50 px-4 py-3"
          >
            <span className="text-sm font-medium text-[#FFD94C]">{label}</span>
            <div className="mt-1 space-y-1">
              {titles.length > 0 ? (
                titles.map((title, i) => (
                  <p key={i} className="text-sm text-[#F0F0F0]">{title}</p>
                ))
              ) : (
                <p className="text-sm text-[#F0F0F0]/40 italic">Chưa vote</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
