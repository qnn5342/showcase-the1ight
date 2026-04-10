"use client";

interface VoteBottomBarProps {
  userVotes: { project_id: string; category: string }[];
}

export function VoteBottomBar({ userVotes }: VoteBottomBarProps) {
  const usedCount = userVotes.length;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-3 px-4"
      style={{
        backgroundColor: "#214C54",
        borderTop: "1px solid #3E5E63",
      }}
    >
      <p className="text-sm" style={{ color: "#F0F0F0" }}>
        Phiếu bầu của bạn:{" "}
        <span className="font-bold text-base" style={{ color: "#FFD94C" }}>
          {usedCount}
        </span>
        <span style={{ color: "#F0F0F0" }}>/3 đã dùng</span>
      </p>
    </div>
  );
}
