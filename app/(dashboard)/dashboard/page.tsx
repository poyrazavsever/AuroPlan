import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import StreakWidget from "@/components/dashboard/StreakWidget";
import XpProgressWidget from "@/components/dashboard/XpProgressWidget";
import {
  getGlobalLeaderboard,
  getUserStreak,
  updateDailyActivity,
} from "./leaderboard/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Kullanıcı profili
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Günlük aktivite güncelle (streak için)
  await updateDailyActivity();

  // Verileri getir
  const [leaderboardData, streakData] = await Promise.all([
    getGlobalLeaderboard(10),
    getUserStreak(),
  ]);

  // Görev istatistikleri
  const { count: pendingTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", user.id)
    .in("status", ["todo", "in_progress"]);

  const { count: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", user.id)
    .eq("status", "done");

  const totalTasks = (pendingTasks || 0) + (completedTasks || 0);
  const completionRate =
    totalTasks > 0 ? Math.round(((completedTasks || 0) / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hoşgeldin Mesajı */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Hoş geldin
            {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
            👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Bugün işlerini tamamlamak için harika bir gün.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <Icon icon="heroicons:plus" />
          Hızlı Görev Ekle
        </button>
      </div>

      {/* Ana Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - İstatistikler ve Widget'lar */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Progress Widget */}
          <XpProgressWidget
            currentXp={profile?.total_xp || 0}
            level={profile?.level || 1}
            todayXp={0}
          />

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:list-bullet" className="text-xl" />
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  Aktif
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {pendingTasks || 0}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                Bekleyen Görev
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-green-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:check-circle" className="text-xl" />
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  Toplam
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {completedTasks || 0}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Tamamlanan</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:chart-pie" className="text-xl" />
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  Oran
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                %{completionRate}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Tamamlanma</div>
            </div>
          </div>

          {/* Streak Widget */}
          <StreakWidget
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            lastActiveDate={streakData.lastActiveDate}
          />
        </div>

        {/* Sağ Kolon - Leaderboard */}
        <div className="space-y-6">
          <MiniLeaderboard
            users={leaderboardData.users}
            currentUserId={user.id}
            currentUserRank={leaderboardData.currentUserRank}
          />

          {/* Hızlı Erişim */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Hızlı Erişim</h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/dashboard/tasks"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Icon icon="heroicons:check-circle" className="text-blue-500" />
                <span className="text-sm font-medium text-slate-700">
                  Görevler
                </span>
              </a>
              <a
                href="/dashboard/projects"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Icon icon="heroicons:folder" className="text-purple-500" />
                <span className="text-sm font-medium text-slate-700">
                  Projeler
                </span>
              </a>
              <a
                href="/dashboard/learn"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Icon
                  icon="heroicons:academic-cap"
                  className="text-green-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Öğren
                </span>
              </a>
              <a
                href="/dashboard/achievements"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Icon icon="heroicons:trophy" className="text-amber-500" />
                <span className="text-sm font-medium text-slate-700">
                  Başarımlar
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
