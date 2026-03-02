import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/email-templates";
import SignOutButton from "./components/SignOutButton";
import Logo from "@/app/components/Logo";
import DashboardTopBar from "./components/DashboardTopBar";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Nesco Digital AI <noreply@nescodigital.com>";

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

  // Send welcome email on first dashboard load (fire-and-forget)
  if (user.email) {
    try {
      // Use admin client to bypass RLS on email_sequence_log
      const admin = createAdminClient();
      const { data: existing } = await admin
        .from("email_sequence_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("email_type", "welcome")
        .maybeSingle();

      if (!existing) {
        const { subject, html } = welcomeEmail(user.email);
        await resend.emails.send({ from: FROM, to: user.email, subject, html });
        await admin.from("email_sequence_log").insert({
          user_id: user.id,
          email: user.email,
          email_type: "welcome",
          sent_at: new Date().toISOString(),
        });
      }
    } catch {
      // Non-blocking — don't break dashboard if email fails
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <DashboardTopBar />
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
