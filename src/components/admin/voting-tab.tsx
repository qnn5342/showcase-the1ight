"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  advanceVotingSession,
  upsertJuryPick,
} from "@/lib/actions/voting-session";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Cohort = { id: string; name: string; slug: string; status: string };
type Session = {
  id: string;
  cohort_id: string;
  status: string;
  opened_at: string | null;
  closed_at: string | null;
  revealed_at: string | null;
};
type Project = { id: string; title: string; cohort_id: string; status: string };
type JuryPick = { id: string; cohort_id: string; project_id: string; note: string | null };

type VoteResult = {
  project_id: string;
  title: string;
  category: string;
  vote_count: number;
};

const SESSION_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#6b7280", text: "#fff" },
  open: { bg: "#16a34a", text: "#fff" },
  closed: { bg: "#ca8a04", text: "#fff" },
  revealed: { bg: "#2563eb", text: "#fff" },
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  pending: "Mở Vote (→ open)",
  open: "Đóng Vote (→ closed)",
  closed: "Công bố Kết quả (→ revealed)",
};

export function VotingTab({
  cohorts,
  sessions,
  projects,
  juryPicks,
}: {
  cohorts: Cohort[];
  sessions: Session[];
  projects: Project[];
  juryPicks: JuryPick[];
}) {
  const [selectedCohortId, setSelectedCohortId] = useState(
    cohorts[0]?.id ?? ""
  );
  const [juryProjectId, setJuryProjectId] = useState("");
  const [juryNote, setJuryNote] = useState("");
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isJuryPending, startJuryTransition] = useTransition();

  const currentSession = sessions.find(
    (s) => s.cohort_id === selectedCohortId
  );
  const currentStatus = currentSession?.status ?? "pending";
  const statusColors = SESSION_STATUS_COLORS[currentStatus] ?? SESSION_STATUS_COLORS.pending;
  const nextLabel = NEXT_STATUS_LABEL[currentStatus];

  const cohortProjects = projects.filter(
    (p) => p.cohort_id === selectedCohortId
  );
  const existingJuryPick = juryPicks.find(
    (j) => j.cohort_id === selectedCohortId
  );

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceVotingSession(selectedCohortId);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if ("status" in result && result.status) {
        toast.success(`Trạng thái mới: ${result.status}`);
        // If revealed, fetch vote results
        if (result.status === "revealed") {
          await fetchVoteResults();
        }
      }
    });
  }

  async function fetchVoteResults() {
    const supabase = createClient();
    const { data } = await supabase
      .from("public_vote_counts")
      .select("*")
      .eq("cohort_id", selectedCohortId)
      .order("vote_count", { ascending: false });
    setVoteResults(data ?? []);
  }

  function handleSaveJuryPick() {
    if (!juryProjectId) {
      toast.error("Vui lòng chọn dự án.");
      return;
    }
    startJuryTransition(async () => {
      const result = await upsertJuryPick(
        selectedCohortId,
        juryProjectId,
        juryNote
      );
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Đã lưu Jury Pick!");
      }
    });
  }

  function handleExportCSV() {
    if (voteResults.length === 0) {
      toast.error("Chưa có dữ liệu để xuất.");
      return;
    }
    const header = "Project ID,Title,Category,Vote Count";
    const rows = voteResults.map(
      (r) => `${r.project_id},"${r.title}",${r.category},${r.vote_count}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vote-results-${selectedCohortId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Cohort Selector */}
      <div>
        <Label style={{ color: "#F0F0F0" }}>Chọn Cohort</Label>
        <Select
          value={selectedCohortId}
          onValueChange={(v) => v && setSelectedCohortId(v)}
        >
          <SelectTrigger
            className="mt-1 w-64"
            style={{
              backgroundColor: "#214C54",
              borderColor: "#3E5E63",
              color: "#F0F0F0",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
          >
            {cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id} style={{ color: "#F0F0F0" }}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Session Status */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              Trạng thái phiên vote
            </p>
            <Badge
              className="mt-1"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
              }}
            >
              {currentStatus}
            </Badge>
          </div>
          {nextLabel && (
            <Button
              onClick={handleAdvance}
              disabled={isPending}
              style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
            >
              {isPending ? "Đang xử lý..." : nextLabel}
            </Button>
          )}
          {!nextLabel && (
            <span className="text-sm" style={{ color: "#9ca3af" }}>
              Đã hoàn tất
            </span>
          )}
        </div>

        {/* Timestamps */}
        {currentSession && (
          <div className="mt-3 space-y-1 text-xs" style={{ color: "#9ca3af" }}>
            {currentSession.opened_at && (
              <p>Mở: {new Date(currentSession.opened_at).toLocaleString("vi-VN")}</p>
            )}
            {currentSession.closed_at && (
              <p>Đóng: {new Date(currentSession.closed_at).toLocaleString("vi-VN")}</p>
            )}
            {currentSession.revealed_at && (
              <p>Công bố: {new Date(currentSession.revealed_at).toLocaleString("vi-VN")}</p>
            )}
          </div>
        )}
      </div>

      {/* Vote Results (only when revealed) */}
      {currentStatus === "revealed" && (
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: "#FDF5DA" }}>
              Kết Quả Vote
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVoteResults}
                style={{ borderColor: "#3E5E63", color: "#F0F0F0" }}
              >
                Tải lại
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                style={{ borderColor: "#3E5E63", color: "#F0F0F0" }}
              >
                Xuất CSV
              </Button>
            </div>
          </div>
          {voteResults.length === 0 ? (
            <p style={{ color: "#9ca3af" }} className="text-sm">
              Nhấn &ldquo;Tải lại&rdquo; để xem kết quả.
            </p>
          ) : (
            <div className="space-y-2">
              {voteResults.map((r, i) => (
                <div
                  key={`${r.project_id}-${r.category}`}
                  className="flex items-center justify-between rounded p-2"
                  style={{ backgroundColor: "#15333B" }}
                >
                  <div>
                    <span className="text-sm font-medium" style={{ color: "#FDF5DA" }}>
                      {r.title}
                    </span>
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      {r.category}
                    </span>
                  </div>
                  <Badge style={{ backgroundColor: "#FFD94C", color: "#15333B" }}>
                    {r.vote_count} votes
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jury Pick */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <h3 className="mb-3 font-semibold" style={{ color: "#FDF5DA" }}>
          Jury Pick
        </h3>
        {existingJuryPick && (
          <p className="mb-2 text-sm" style={{ color: "#FFD94C" }}>
            Đã chọn:{" "}
            {projects.find((p) => p.id === existingJuryPick.project_id)?.title ??
              existingJuryPick.project_id}
            {existingJuryPick.note && ` — ${existingJuryPick.note}`}
          </p>
        )}
        <div className="space-y-3">
          <div>
            <Label style={{ color: "#F0F0F0" }}>Dự án</Label>
            <Select value={juryProjectId} onValueChange={(v) => v && setJuryProjectId(v)}>
              <SelectTrigger
                className="mt-1"
                style={{
                  backgroundColor: "#15333B",
                  borderColor: "#3E5E63",
                  color: "#F0F0F0",
                }}
              >
                <SelectValue placeholder="Chọn dự án..." />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
              >
                {cohortProjects.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    style={{ color: "#F0F0F0" }}
                  >
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label style={{ color: "#F0F0F0" }}>Ghi chú (tùy chọn)</Label>
            <Textarea
              value={juryNote}
              onChange={(e) => setJuryNote(e.target.value)}
              placeholder="Lý do chọn..."
              className="mt-1"
              style={{
                backgroundColor: "#15333B",
                borderColor: "#3E5E63",
                color: "#F0F0F0",
              }}
            />
          </div>
          <Button
            onClick={handleSaveJuryPick}
            disabled={isJuryPending}
            style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
          >
            {isJuryPending ? "Đang lưu..." : "Lưu Jury Pick"}
          </Button>
        </div>
      </div>
    </div>
  );
}
