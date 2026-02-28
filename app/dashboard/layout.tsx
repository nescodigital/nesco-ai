import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px", color: "white" }}>
          nesco<span style={{ color: "#56db84" }}>AI</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
