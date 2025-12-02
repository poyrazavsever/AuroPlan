import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAchievements, getUserAchievementStats } from "./actions";
import AchievementCard from "@/components/achievements/AchievementCard";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profil bilgisi
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, level")
    .eq("id", user.id)
    .single();

  // Başarımları ve istatistikleri çek
  const [achievements, stats] = await Promise.all([
    getAchievements("global"),
    getUserAchievementStats(),
  ]);

  const currentXP = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const nextLevelXP = level * 100;
  const progressPercent = Math.min(((currentXP % 100) / 100) * 100, 100);

  // Kategorilere ayır
  const categories = [
    { key: "onboarding", label: "Hoş Geldin", icon: "heroicons:hand-raised" },
    { key: "tasks", label: "Görevler", icon: "heroicons:check-circle" },
    { key: "projects", label: "Projeler", icon: "heroicons:folder-open" },
    { key: "learning", label: "Öğrenme", icon: "heroicons:academic-cap" },
    { key: "level", label: "Seviye & XP", icon: "heroicons:star" },
    { key: "collaboration", label: "İşbirliği", icon: "heroicons:user-group" },
  ];

  const achievementsByCategory = categories.map((cat) => ({
    ...cat,
    achievements: achievements.filter((a) => a.category === cat.key),
  }));

  // Kazanılan ve sürüyor olanları ayır
  const earnedAchievements = achievements.filter(
    (a) => a.user_progress && a.user_progress.earned_at
  );
  const inProgressAchievements = achievements.filter(
    (a) =>
      a.user_progress &&
      !a.user_progress.earned_at &&
      a.user_progress.progress > 0
  );

  return (
    <div className="space-y-10 pb-20">
      {/* --- HEADER & STATS --- */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sol: Karşılama ve Level */}
        <div className="md:col-span-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          {/* Dekoratif */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                Level {level}
              </span>
              <span className="text-amber-100 text-xs font-medium">
                Başarım Avcısı
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Icon icon="heroicons:trophy" className="text-4xl" />
              Başarımlarım
            </h1>
            <p className="text-amber-100 text-sm max-w-lg leading-relaxed opacity-90">
              Her başarım seni bir adım öne taşır. Görevlerini tamamla,
              projelerini bitir ve XP kazanarak yeni rozetler aç!
            </p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-amber-100">Sonraki Seviye</span>
              <span className="text-white">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white to-amber-200 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sağ: İstatistik Özeti */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Icon icon="heroicons:trophy" className="text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {stats?.earned || 0}
                <span className="text-slate-400 text-lg font-normal">
                  /{stats?.total || 0}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase">
                Kazanılan
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Icon icon="heroicons:sparkles" className="text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                +{stats?.totalXpFromAchievements || 0}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase">
                Başarım XP'si
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Icon icon="heroicons:chart-pie" className="text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                %{stats?.completionRate || 0}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase">
                Tamamlanma
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SON KAZANILANLAR --- */}
      {earnedAchievements.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon icon="heroicons:check-badge" className="text-green-600" />
            Son Kazanılanlar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {earnedAchievements.slice(0, 6).map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* --- DEVAM EDENLER --- */}
      {inProgressAchievements.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon
              icon="heroicons:arrow-trending-up"
              className="text-blue-600"
            />
            Devam Edenler
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </section>
      )}

      {/* --- KATEGORİLER --- */}
      <section className="space-y-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="heroicons:squares-2x2" />
          Tüm Başarımlar
        </h2>

        {achievementsByCategory.map((category) => {
          if (category.achievements.length === 0) return null;

          return (
            <div key={category.key}>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icon icon={category.icon} className="text-lg" />
                {category.label}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
