"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

interface LeaderboardUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  rank: number;
}

interface MiniLeaderboardProps {
  users: LeaderboardUser[];
  currentUserId: string;
  currentUserRank?: number | null;
}

export default function MiniLeaderboard({
  users,
  currentUserId,
  currentUserRank,
}: MiniLeaderboardProps) {
  const topUsers = users.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="heroicons:trophy" className="text-amber-500" />
          Liderler
        </h3>
        <Link
          href="/dashboard/leaderboard"
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              user.id === currentUserId ? "bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            {/* Rank */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                index === 0
                  ? "bg-amber-100 text-amber-700"
                  : index === 1
                  ? "bg-slate-200 text-slate-600"
                  : index === 2
                  ? "bg-orange-100 text-orange-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {index === 0 ? (
                <Icon icon="heroicons:crown-solid" className="text-sm" />
              ) : (
                index + 1
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="avatar"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-xs font-bold text-slate-500">
                  {user.full_name?.[0] || "?"}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.full_name || "Anonim"}
                {user.id === currentUserId && (
                  <span className="ml-1 text-[10px] text-blue-600">(Siz)</span>
                )}
              </p>
            </div>

            {/* XP */}
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">
                {user.total_xp?.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">XP</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current user rank if not in top 5 */}
      {currentUserRank && currentUserRank > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Sizin sıralamanız:</span>
            <span className="font-bold text-blue-600">#{currentUserRank}</span>
          </div>
        </div>
      )}
    </div>
  );
}
