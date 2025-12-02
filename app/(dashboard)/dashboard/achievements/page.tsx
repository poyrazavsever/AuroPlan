import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import AchievementCard from "@/components/achievements/AchievementCard";
import CreateAchievementModal from "@/components/achievements/CreateAchievementModal";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Kullanıcı Bilgileri (XP ve Level)
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  const currentXP = profile?.total_xp || 0;
  const level = Math.floor(currentXP / 500) + 1; // Her 500 XP = 1 Level
  const nextLevelXP = level * 500;
  const progressPercent = Math.min(((currentXP % 500) / 500) * 100, 100);

  // 2. Tüm Başarımları Çek (Sistem + Üyesi olduğum Takım/Projeler)
  // (RLS politikası sayesinde sadece görmem gerekenler gelecek)
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("xp_value", { ascending: true });

  // 3. Kullanıcının Kazandıklarını Çek
  const { data: myAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", user.id);

  // Kazanılanları Map'le (Hızlı erişim için)
  const earnedMap = new Map();
  myAchievements?.forEach((ua) =>
    earnedMap.set(ua.achievement_id, ua.earned_at)
  );

  // 4. Yönetici mi? (Modal için veri çek)
  // Kullanıcının yönetici olduğu takımları ve projeleri bulalım
  const { data: myTeams } = await supabase
    .from("team_members")
    .select("teams(id, name)")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"]);
  const adminTeams = myTeams?.map((t: any) => t.teams).filter(Boolean) || [];

  // Proje yöneticiliği için de benzer bir sorgu yapılabilir, şimdilik takım yeterli
  // (Projeleri de eklemek isterseniz buraya ekleyebilirsiniz)
  const adminProjects: any[] = [];

  const canCreate = adminTeams.length > 0;

  return (
    <div className="space-y-10 pb-20">
      {/* --- HERO SECTION (Level & Stats) --- */}
      <div className="relative bg-primary rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        {/* Arkaplan Efektleri */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-linear-to-br from-amber-300 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform rotate-3 border-4 border-white/50">
              🏆
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                Seviye {level}
              </h1>
              <p className="text-slate-400 text-sm">
                Toplam {currentXP} XP kazandın. Harika gidiyorsun!
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
              <span className="text-slate-400">İlerleme</span>
              <span className="text-amber-400">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="w-full bg-white h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-1000 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">
              Sonraki seviyeye {nextLevelXP - currentXP} XP kaldı.
            </p>
          </div>
        </div>
      </div>

      {/* --- ACTIONS BAR --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="heroicons:trophy" className="text-amber-500" />
          Başarım Koleksiyonu
        </h2>

        {canCreate && (
          <CreateAchievementModal teams={adminTeams} projects={adminProjects} />
        )}
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allAchievements?.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            earnedAt={earnedMap.get(achievement.id)}
          />
        ))}

        {(!allAchievements || allAchievements.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500">Henüz tanımlanmış bir başarım yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
