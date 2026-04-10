import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, live_url")
    .eq("status", "published")
    .not("live_url", "is", null);

  if (!projects?.length) return NextResponse.json({ checked: 0 });

  const results: { id: string; isOffline: boolean }[] = [];

  await Promise.allSettled(
    projects.map(async (p) => {
      let isOffline = false;
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(p.live_url!, { method: "HEAD", signal: controller.signal, redirect: "follow" });
        clearTimeout(t);
        isOffline = res.status >= 400;
      } catch {
        isOffline = true;
      }
      results.push({ id: p.id, isOffline });
    })
  );

  await Promise.allSettled(
    results.map(({ id, isOffline }) =>
      supabase.from("projects").update({ is_offline: isOffline }).eq("id", id)
    )
  );

  return NextResponse.json({
    checked: results.length,
    offline: results.filter(r => r.isOffline).length,
    timestamp: new Date().toISOString(),
  });
}
