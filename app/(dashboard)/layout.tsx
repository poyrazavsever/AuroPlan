import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sunucu tarafında oturum kontrolü
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Eğer kullanıcı yoksa veya hata varsa login'e at
  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Masaüstünde sabit */}
      <Sidebar />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <Header user={user} />

        {/* Sayfa İçeriği */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
