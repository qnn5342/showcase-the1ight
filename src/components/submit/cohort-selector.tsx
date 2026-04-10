"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Course {
  id: string;
  name: string;
  slug: string;
  cohorts: Cohort[];
}

interface Cohort {
  id: string;
  name: string;
  slug: string;
}

interface CohortSelectorProps {
  value: string;
  onChange: (cohortId: string) => void;
  disabled?: boolean;
}

export function CohortSelector({ value, onChange, disabled }: CohortSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, name, slug")
        .order("created_at");

      const { data: cohortsData } = await supabase
        .from("cohorts")
        .select("id, name, slug, course_id")
        .order("created_at");

      if (coursesData && cohortsData) {
        const grouped = coursesData.map((c) => ({
          ...c,
          cohorts: cohortsData.filter((ch) => ch.course_id === c.id),
        }));
        setCourses(grouped);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-10 bg-[#15333B] border border-[#3E5E63] rounded-md animate-pulse" />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full h-10 px-3 rounded-md bg-[#15333B] border border-[#3E5E63] text-[#F0F0F0] focus:ring-2 focus:ring-[#FFD94C]/50 focus:outline-none disabled:opacity-50"
    >
      <option value="">Chọn khoá & lớp...</option>
      {courses.map((course) => (
        <optgroup key={course.id} label={course.name}>
          {course.cohorts.map((cohort) => (
            <option key={cohort.id} value={cohort.id}>
              {course.name} — {cohort.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
