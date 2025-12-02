import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import {
  getGlobalLeaderboard,
  getTeamsLeaderboard,
  getUserStats,
} from "./actions";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; period?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const activeTab = params?.tab || "global";
  const period = (params?.period as "all" | "weekly" | "monthly") || "all";

  // Verileri getir
  const [globalData, teamsData, userStats] = await Promise.all([
    getGlobalLeaderboard(50, period),
    getTeamsLeaderboard(20),
    getUserStats(),
  ]);

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Icon icon="heroicons:trophy" className="text-xl" />
            </div>
            Sıralama Tablosu
          </h1>
          <p className="text-slate-500 mt-1">
            En aktif kullanıcılar ve takımlar
          </p>
        </div>

        {/* Kullanıcı Özet Kartı */}
        {userStats && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {userStats.avatar_url ? (
                  <Image
                    src={userStats.avatar_url}
                    alt="avatar"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="text-lg font-bold">
                    {userStats.full_name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-white/80 text-sm">Sıralamanız</p>
                <p className="text-2xl font-bold">#{userStats.globalRank}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white/80 text-sm">
                  Seviye {userStats.level}
                </p>
                <p className="font-bold">
                  {userStats.total_xp?.toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <div className="flex gap-1">
          <Link
            href={`/dashboard/leaderboard?tab=global&period=${period}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "global"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon icon="heroicons:globe-alt" />
              Global
            </span>
          </Link>
          <Link
            href={`/dashboard/leaderboard?tab=teams&period=${period}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "teams"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon icon="heroicons:user-group" />
              Takımlar
            </span>
          </Link>
        </div>

        {/* Period Filter (sadece global için) */}
        {activeTab === "global" && (
          <div className="flex gap-1 ml-auto">
            <Link
              href={`/dashboard/leaderboard?tab=global&period=all`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === "all"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              Tüm Zamanlar
            </Link>
            <Link
              href={`/dashboard/leaderboard?tab=global&period=weekly`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === "weekly"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              Bu Hafta
            </Link>
            <Link
              href={`/dashboard/leaderboard?tab=global&period=monthly`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === "monthly"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              Bu Ay
            </Link>
          </div>
        )}
      </div>

      {/* Global Leaderboard */}
      {activeTab === "global" && (
        <div className="space-y-4">
          {/* Top 3 Podium */}
          {globalData.users.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2. Sıra */}
              <div className="flex flex-col items-center pt-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center overflow-hidden">
                    {globalData.users[1]?.avatar_url ? (
                      <Image
                        src={globalData.users[1].avatar_url}
                        alt="avatar"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-slate-500">
                        {globalData.users[1]?.full_name?.[0] || "?"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    2
                  </div>
                </div>
                <p className="mt-4 font-bold text-slate-900 text-center truncate max-w-full">
                  {globalData.users[1]?.full_name || "Anonim"}
                </p>
                <p className="text-sm text-slate-500">
                  {globalData.users[1]?.total_xp?.toLocaleString()} XP
                </p>
              </div>

              {/* 1. Sıra */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center overflow-hidden ring-4 ring-amber-200">
                    {globalData.users[0]?.avatar_url ? (
                      <Image
                        src={globalData.users[0].avatar_url}
                        alt="avatar"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-amber-600">
                        {globalData.users[0]?.full_name?.[0] || "?"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    <Icon icon="heroicons:crown-solid" className="text-lg" />
                  </div>
                </div>
                <p className="mt-4 font-bold text-slate-900 text-lg text-center truncate max-w-full">
                  {globalData.users[0]?.full_name || "Anonim"}
                </p>
                <p className="text-sm text-amber-600 font-medium">
                  {globalData.users[0]?.total_xp?.toLocaleString()} XP
                </p>
              </div>

              {/* 3. Sıra */}
              <div className="flex flex-col items-center pt-12">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center overflow-hidden">
                    {globalData.users[2]?.avatar_url ? (
                      <Image
                        src={globalData.users[2].avatar_url}
                        alt="avatar"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <span className="text-xl font-bold text-orange-500">
                        {globalData.users[2]?.full_name?.[0] || "?"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    3
                  </div>
                </div>
                <p className="mt-4 font-bold text-slate-900 text-center truncate max-w-full">
                  {globalData.users[2]?.full_name || "Anonim"}
                </p>
                <p className="text-sm text-slate-500">
                  {globalData.users[2]?.total_xp?.toLocaleString()} XP
                </p>
              </div>
            </div>
          )}

          {/* Rest of the list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                    Sıra
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                    Seviye
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">
                    XP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {globalData.users.slice(3).map((userItem: any) => (
                  <tr
                    key={userItem.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      userItem.id === user.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-400">
                        #{userItem.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                          {userItem.avatar_url ? (
                            <Image
                              src={userItem.avatar_url}
                              alt="avatar"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-500">
                              {userItem.full_name?.[0] || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {userItem.full_name || "Anonim"}
                            {userItem.id === user.id && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                Siz
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Icon
                          icon="heroicons:star-solid"
                          className="text-amber-400"
                        />
                        <span className="font-medium text-slate-700">
                          {userItem.level || 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-900">
                        {userItem.total_xp?.toLocaleString() || 0}
                      </span>
                      <span className="text-slate-400 ml-1">XP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {globalData.users.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                Henüz sıralama verisi yok.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teams Leaderboard */}
      {activeTab === "teams" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamsData.teams.map((team: any) => {
            const isUserTeam = teamsData.userTeamRanks?.some(
              (r: any) => r.teamId === team.id
            );
            return (
              <div
                key={team.id}
                className={`bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow ${
                  isUserTeam
                    ? "border-blue-300 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      team.rank === 1
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                        : team.rank === 2
                        ? "bg-slate-300 text-slate-700"
                        : team.rank === 3
                        ? "bg-orange-300 text-orange-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    #{team.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate flex items-center gap-2">
                      {team.name}
                      {isUserTeam && (
                        <Icon
                          icon="heroicons:check-badge-solid"
                          className="text-blue-500"
                        />
                      )}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {team.memberCount} üye
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Toplam XP</p>
                    <p className="font-bold text-slate-900">
                      {team.totalXp?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ortalama XP</p>
                    <p className="font-bold text-slate-900">
                      {team.avgXp?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {teamsData.teams.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 rounded-2xl">
              Henüz takım sıralaması yok.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
