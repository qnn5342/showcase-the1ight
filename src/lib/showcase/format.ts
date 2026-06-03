export function getSeasonPath(slug: string) {
  return `/seasons/${slug}`;
}

export function getCohortLabel(
  cohort:
    | {
        name?: string | null;
        class_code?: string | null;
      }
    | null
    | undefined
) {
  if (!cohort?.class_code) return cohort?.name ?? "Lớp chưa đặt tên";
  return `${cohort.class_code} - ${cohort.name}`;
}
