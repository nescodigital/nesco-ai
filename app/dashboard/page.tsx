import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-zinc-400 mb-6">
        Bine ai venit, <span className="text-white">{user?.email}</span>.
      </p>
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
        <p className="text-sm text-zinc-400 mb-2">
          Autentificare reușită. User ID:
        </p>
        <code className="text-xs text-[#56db84] break-all">{user?.id}</code>
      </div>
    </div>
  );
}
