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
  const voteMap = new Map(votes.map((v) => [v.category, v.project_title]));

  return (
    <div className="space-y-2">
      {CATEGORIES.map(({ key, label }) => {
        const projectTitle = voteMap.get(key);
        return (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-[#3E5E63] bg-[#214C54]/50 px-4 py-3"
          >
            <span className="text-sm font-medium text-[#FFD94C]">{label}</span>
            <span className="text-sm text-[#F0F0F0]">
              {projectTitle ?? (
                <span className="text-[#F0F0F0]/40 italic">Chưa vote</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
