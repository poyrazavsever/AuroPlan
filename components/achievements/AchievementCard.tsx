"use client";

import { Icon } from "@iconify/react";
import type { AchievementWithProgress } from "@/types/supabase";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Badge renk eşlemesi
const badgeColors: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    glow: "shadow-amber-100",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    glow: "shadow-blue-100",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    glow: "shadow-green-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    glow: "shadow-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    glow: "shadow-purple-100",
  },
};

type Props = {
  achievement: AchievementWithProgress;
  compact?: boolean;
};

export default function AchievementCard({
  achievement,
  compact = false,
}: Props) {
  const colors = badgeColors[achievement.badge_color] || badgeColors.amber;
  const isEarned = achievement.user_progress?.earned_at;
  const progress = achievement.user_progress?.progress || 0;
  const progressMax =
    achievement.user_progress?.progress_max || achievement.trigger_value || 1;
  const progressPercent = Math.min((progress / progressMax) * 100, 100);

  // Compact görünüm (son kazanılanlar için)
  if (compact) {
    return (
      <div
        className={`relative p-4 rounded-xl border transition-all ${
          isEarned
            ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
            : "bg-slate-50 border-slate-200 opacity-50"
        }`}
      >
        {/* Kazanıldı işareti */}
        {isEarned && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Icon icon="heroicons:check" className="text-white text-xs" />
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
              isEarned
                ? `${colors.bg} ${colors.text}`
                : "bg-slate-200 text-slate-400"
            }`}
          >
            <Icon icon={achievement.icon} className="text-2xl" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
            {achievement.title}
          </h3>
          <span className={`text-[10px] font-bold mt-1 ${colors.text}`}>
            +{achievement.xp_reward} XP
          </span>
        </div>
      </div>
    );
  }

  // Tam görünüm
  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${
        isEarned
          ? `bg-white ${colors.border} shadow-sm`
          : progress > 0
          ? "bg-white border-slate-200"
          : "bg-slate-50/50 border-slate-200/50"
      }`}
    >
      {/* Kazanıldı işareti */}
      {isEarned && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
          <Icon icon="heroicons:check" className="text-white text-sm" />
        </div>
      )}

      <div className="flex gap-4">
        {/* İkon */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isEarned
              ? `${colors.bg} ${colors.text}`
              : progress > 0
              ? "bg-slate-100 text-slate-500"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Icon icon={achievement.icon} className="text-3xl" />
        </div>

        {/* İçerik */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={`font-bold ${
                isEarned ? "text-slate-900" : "text-slate-700"
              }`}
            >
              {achievement.title}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${
                isEarned
                  ? `${colors.bg} ${colors.text}`
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              +{achievement.xp_reward} XP
            </span>
          </div>

          <p
            className={`text-sm mb-3 ${
              isEarned ? "text-slate-600" : "text-slate-500"
            }`}
          >
            {achievement.description}
          </p>

          {/* Progress bar veya tarih */}
          {isEarned ? (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <Icon icon="heroicons:check-circle" />
              <span>
                {format(
                  new Date(achievement.user_progress!.earned_at!),
                  "d MMM yyyy",
                  {
                    locale: tr,
                  }
                )}
                {" tarihinde kazanıldı"}
              </span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>İlerleme</span>
                <span className="font-bold">
                  {progress} / {progressMax}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    progress > 0
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-slate-300"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
