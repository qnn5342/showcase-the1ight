import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#15333B" }}>
      <div className="border-b" style={{ borderColor: "#3E5E63" }}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1
            className="text-xl font-bold"
            style={{ color: "#FFD94C", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Admin — Showcase The1ight
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
