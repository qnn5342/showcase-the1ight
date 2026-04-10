export function OfflineBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
      style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44" }}
      title="Trang web này có thể không còn hoạt động"
    >
      ⚠️ Site có thể đang offline
    </span>
  );
}
