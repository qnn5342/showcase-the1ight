import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle, signOut } from "@/lib/actions/auth";
import Image from "next/image";
import Link from "next/link";

export async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD94C] px-4 py-2 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90"
        >
          Đăng nhập
        </button>
      </form>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email ?? "User";
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex items-center gap-3">
      <Link href="/me" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName} width={32} height={32} className="rounded-full ring-2 ring-[#3E5E63]" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#214C54] ring-2 ring-[#3E5E63] text-xs font-bold text-[#FFD94C]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm text-[#F0F0F0] sm:block">{displayName}</span>
      </Link>
      <form action={signOut}>
        <button type="submit" className="rounded-lg border border-[#3E5E63] px-3 py-1.5 text-xs text-[#F0F0F0]/70 transition-colors hover:border-[#FFD94C] hover:text-[#FFD94C]">
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
