"use client";

import { Icon } from "@iconify/react";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export default function StreakWidget({
  currentStreak,
  longestStreak,
  lastActiveDate,
}: StreakWidgetProps) {
  const today = new Date().toISOString().split("T")[0];
  const isActiveToday = lastActiveDate === today;

  // Streak durumuna göre renk
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "from-purple-500 to-pink-500";
    if (streak >= 14) return "from-orange-500 to-red-500";
    if (streak >= 7) return "from-amber-500 to-orange-500";
    if (streak >= 3) return "from-yellow-400 to-amber-500";
    return "from-slate-400 to-slate-500";
  };

  // Haftalık gösterim (son 7 gün)
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Pazartesi = 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="heroicons:fire" className="text-orange-500" />
          Aktivite Serisi
        </h3>
        {isActiveToday && (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Bugün aktif ✓
          </span>
        )}
      </div>

      {/* Main Streak Display */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStreakColor(
            currentStreak
          )} flex items-center justify-center text-white shadow-lg`}
        >
          <div className="text-center">
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-[10px] opacity-80">gün</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500">Mevcut Seri</p>
          <p className="text-lg font-bold text-slate-900">
            {currentStreak} Gün{" "}
            {currentStreak >= 7 && (
              <Icon
                icon="heroicons:fire"
                className="inline text-orange-500 animate-pulse"
              />
            )}
          </p>
          <p className="text-xs text-slate-400">En uzun: {longestStreak} gün</p>
        </div>
      </div>

      {/* Weekly Activity Dots */}
      <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
        {weekDays.map((day, index) => {
          const isToday = index === adjustedIndex;
          const isPast = index < adjustedIndex;
          // Basit streak gösterimi: streak kadar geri git
          const daysAgo = adjustedIndex - index;
          const isStreakDay = isPast && daysAgo < currentStreak;

          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400">{day}</span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isToday && isActiveToday
                    ? "bg-green-500 text-white"
                    : isToday
                    ? "bg-slate-300 text-white ring-2 ring-slate-400"
                    : isStreakDay
                    ? "bg-orange-400 text-white"
                    : isPast
                    ? "bg-slate-200"
                    : "bg-slate-100"
                }`}
              >
                {(isStreakDay || (isToday && isActiveToday)) && (
                  <Icon icon="heroicons:check" className="text-xs" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation Message */}
      <div className="mt-4 text-center">
        {!isActiveToday && (
          <p className="text-sm text-slate-500">
            <Icon
              icon="heroicons:exclamation-circle"
              className="inline mr-1 text-amber-500"
            />
            Serinizi korumak için bugün bir görev tamamlayın!
          </p>
        )}
        {isActiveToday && currentStreak >= 7 && (
          <p className="text-sm text-green-600 font-medium">
            🔥 Harika gidiyorsunuz! {currentStreak} günlük seri!
          </p>
        )}
        {isActiveToday && currentStreak < 7 && (
          <p className="text-sm text-slate-500">
            Devam edin! 7 günlük seriye ulaşın 🎯
          </p>
        )}
      </div>
    </div>
  );
}
