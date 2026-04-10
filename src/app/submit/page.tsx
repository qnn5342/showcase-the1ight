import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <main className="min-h-screen bg-[#15333B] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FDF5DA] mb-2">
            Submit dự án
          </h1>
          <p className="text-[#F0F0F0]/60">
            Chia sẻ sản phẩm bạn đã xây dựng với cộng đồng The1ight.
          </p>
        </div>
        <SubmitForm />
      </div>
    </main>
  );
}
