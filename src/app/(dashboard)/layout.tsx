import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Defense in depth: even if a session exists, only a whitelisted phone
  // number in `admins` may see any gym data (RLS enforces this at the DB
  // layer too, so this is a friendlier redirect rather than the only gate).
  const { data: admin } = await supabase
    .from("admins")
    .select("full_name")
    .eq("phone", user.phone)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  const { data: settings } = await supabase.from("settings").select("gym_name, admin_name").eq("id", 1).single();

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar
        adminName={settings?.admin_name || admin!.full_name}
        gymName={settings?.gym_name || "DS FITNESS"}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">{children}</main>
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
