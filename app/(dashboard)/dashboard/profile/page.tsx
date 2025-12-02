import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ProfileForm from "@/components/profile/ProfileForm";
import { getAchievements } from "../achievements/actions";
import { getGlobalLeaderboard, getUserStreak } from "../leaderboard/actions";

// Level için XP hesapla
function getXpForLevel(level: number): number {
  return level * level * 50;
}

function getXpForNextLevel(currentXp: number, level: number): { current: number; required: number; percentage: number } {
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const percentage = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));
  return { current: xpInCurrentLevel, required: xpNeeded, percentage };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profil verisini çek
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Başarımlar, leaderboard ve streak verilerini al
  const [achievementsResult, leaderboardResult, streakResult] = await Promise.all([
    getAchievements(),
    getGlobalLeaderboard(100),
    getUserStreak(),
  ]);

  const userAchievements = achievementsResult.userAchievements || [];
  const globalRank = leaderboardResult.currentUserRank || leaderboardResult.currentUserData?.rank || null;
  
  // Görev istatistikleri
  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", user.id);

  const { count: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", user.id)
    .eq("status", "done");

  // Öğrenme istatistikleri
  const { count: completedLearnings } = await supabase
    .from("user_learning_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", true);

  const currentXp = profile?.total_xp || 0;
  const currentLevel = profile?.level || 1;
  const xpProgress = getXpForNextLevel(currentXp, currentLevel);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center text-sm text-slate-500 mb-4">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
          <Icon icon="heroicons:chevron-right" className="mx-2 text-xs" />
          <span className="font-semibold text-slate-900">Profil</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900">Profilim</h1>
        <p className="text-slate-500 mt-1">
          Kişisel bilgilerinizi, istatistiklerinizi ve başarımlarınızı görüntüleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Profil Özeti */}
        <div className="space-y-6">
          {/* Avatar ve İsim */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                {currentLevel}
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-4">
              {profile?.full_name || "İsimsiz Kullanıcı"}
            </h2>
            <p className="text-slate-500 text-sm">{user.email}</p>

            {/* XP Progress */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">Level {currentLevel}</span>
                <span className="font-bold text-slate-900">{currentXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Sonraki level için {xpProgress.required - xpProgress.current} XP
              </div>
            </div>
          </div>

          {/* Sıralama ve Streak */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <Icon icon="heroicons:trophy" className="text-2xl text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">
                #{globalRank || "—"}
              </div>
              <div className="text-xs text-amber-600">Global Sıralama</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <Icon icon="heroicons:fire" className="text-2xl text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {streakResult.currentStreak}
              </div>
              <div className="text-xs text-orange-600">Gün Streak</div>
            </div>
          </div>

          {/* Haftalık/Aylık XP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">XP Özeti</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon icon="heroicons:calendar" className="text-green-500" />
                  </div>
                  <span className="text-sm text-slate-600">Bu Hafta</span>
                </div>
                <span className="font-bold text-slate-900">
                  {(profile?.weekly_xp || 0).toLocaleString()} XP
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon icon="heroicons:calendar-days" className="text-blue-500" />
                  </div>
                  <span className="text-sm text-slate-600">Bu Ay</span>
                </div>
                <span className="font-bold text-slate-900">
                  {(profile?.monthly_xp || 0).toLocaleString()} XP
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Icon icon="heroicons:chart-bar" className="text-purple-500" />
                  </div>
                  <span className="text-sm text-slate-600">Toplam</span>
                </div>
                <span className="font-bold text-slate-900">
                  {currentXp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orta Kolon - İstatistikler ve Başarımlar */}
        <div className="lg:col-span-2 space-y-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Icon icon="heroicons:check-circle" className="text-xl text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{completedTasks || 0}</div>
              <div className="text-sm text-slate-500">Tamamlanan Görev</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <Icon icon="heroicons:academic-cap" className="text-xl text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{completedLearnings || 0}</div>
              <div className="text-sm text-slate-500">Öğrenme Tamamlandı</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                <Icon icon="heroicons:trophy" className="text-xl text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{userAchievements.length}</div>
              <div className="text-sm text-slate-500">Başarım Kazanıldı</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
                <Icon icon="heroicons:fire" className="text-xl text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{streakResult.longestStreak}</div>
              <div className="text-sm text-slate-500">En Uzun Streak</div>
            </div>
          </div>

          {/* Son Kazanılan Başarımlar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Son Kazanılan Başarımlar</h3>
              <Link
                href="/dashboard/achievements"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>
            {userAchievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userAchievements.slice(0, 8).map((ua: any) => (
                  <div
                    key={ua.id}
                    className="flex flex-col items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                      style={{
                        backgroundColor: `${ua.achievements?.badge_color}20`,
                        color: ua.achievements?.badge_color,
                      }}
                    >
                      {ua.achievements?.icon || "🏆"}
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-center line-clamp-2">
                      {ua.achievements?.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      +{ua.achievements?.xp_reward} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon icon="heroicons:trophy" className="text-3xl text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">
                  Henüz başarım kazanmadın. Görevleri tamamlayarak başarım kazan!
                </p>
              </div>
            )}
          </div>

          {/* Profil Düzenleme Formu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Profil Ayarları</h3>
            {profile && <ProfileForm profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  );
}
