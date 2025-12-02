"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  totalXp: number;
  weeklyXp?: number;
  memberCount: number;
  rank: number;
}

interface TeamRankingWidgetProps {
  teams: Team[];
  userTeamIds: string[];
  title?: string;
  showWeekly?: boolean;
}

export default function TeamRankingWidget({
  teams,
  userTeamIds,
  title = "Takım Sıralaması",
  showWeekly = false,
}: TeamRankingWidgetProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-500";
      case 2:
        return "text-slate-400";
      case 3:
        return "text-amber-700";
      default:
        return "text-slate-300";
    }
  };

  const getMedalBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-50";
      case 2:
        return "bg-slate-50";
      case 3:
        return "bg-amber-50/50";
      default:
        return "bg-slate-50";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Icon
                icon="heroicons:user-group"
                className="text-white text-xl"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                {showWeekly ? "Bu hafta" : "Tüm zamanlar"} • {teams.length}{" "}
                takım
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/leaderboard?tab=teams"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Tümü →
          </Link>
        </div>
      </div>

      {/* Takım Listesi */}
      <div className="divide-y divide-slate-100">
        {teams.slice(0, 5).map((team) => {
          const isUserTeam = userTeamIds.includes(team.id);
          const xp = showWeekly ? team.weeklyXp || 0 : team.totalXp;

          return (
            <div
              key={team.id}
              className={`p-4 flex items-center gap-4 transition-colors ${
                isUserTeam ? "bg-blue-50/50" : "hover:bg-slate-50"
              }`}
            >
              {/* Sıralama */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getMedalBg(
                  team.rank
                )}`}
              >
                {team.rank <= 3 ? (
                  <Icon
                    icon="heroicons:trophy-solid"
                    className={`text-xl ${getMedalColor(team.rank)}`}
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-400">
                    #{team.rank}
                  </span>
                )}
              </div>

              {/* Takım Bilgisi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 truncate">
                    {team.name}
                  </span>
                  {isUserTeam && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                      SEN
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Icon icon="heroicons:users" className="text-xs" />
                  {team.memberCount} üye
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className="font-bold text-slate-900">
                  {xp.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">XP</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş Durum */}
      {teams.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon
              icon="heroicons:user-group"
              className="text-2xl text-slate-300"
            />
          </div>
          <p className="text-sm text-slate-500">Henüz takım sıralaması yok.</p>
        </div>
      )}

      {/* Footer - İlerleme Çubuğu */}
      {teams.length > 0 && userTeamIds.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          {(() => {
            const userTeam = teams.find((t) => userTeamIds.includes(t.id));
            if (!userTeam) return null;

            const leader = teams[0];
            const progress =
              leader.totalXp > 0
                ? Math.round((userTeam.totalXp / leader.totalXp) * 100)
                : 0;

            return (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Liderle fark</span>
                  <span className="font-medium text-slate-700">
                    {(leader.totalXp - userTeam.totalXp).toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
