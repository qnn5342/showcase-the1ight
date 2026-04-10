import Link from "next/link";

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">Đăng nhập thất bại</h1>
      {message && <p className="max-w-md text-center text-[#F0F0F0]/70">{message}</p>}
      <Link href="/" className="rounded-lg border border-[#3E5E63] px-4 py-2 text-sm text-[#F0F0F0] transition-colors hover:border-[#FFD94C] hover:text-[#FFD94C]">
        Về trang chủ
      </Link>
    </main>
  );
}
