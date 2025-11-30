import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Kullanıcının üye olduğu takımları çek
  // İlişkisel sorgu: team_members -> teams
  const { data: memberships } = await supabase
    .from("team_members")
    .select("teams(id, name, slug)")
    .eq("user_id", user.id);

  // Veriyi düzleştir (Flatten)
  // memberships dizisi şöyle döner: [{ teams: {id:..., name:...} }, ...]
  // Bunu Sidebar'ın beklediği formata çeviriyoruz: [{id:..., name:...}, ...]
  const userTeams = memberships?.map((m: any) => m.teams).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar'a takımları gönderiyoruz */}
      <Sidebar teams={userTeams} userEmail={user.email} />

      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <Header user={user} />

        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
