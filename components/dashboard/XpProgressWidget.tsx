"use client";

import { Icon } from "@iconify/react";

interface XpProgressWidgetProps {
  currentXp: number;
  level: number;
  todayXp?: number;
}

// Level başına gereken XP (basit formül)
function getXpForLevel(level: number): number {
  return level * 100 + (level - 1) * 50;
}

function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

export default function XpProgressWidget({
  currentXp,
  level,
  todayXp = 0,
}: XpProgressWidgetProps) {
  const currentLevelXp = getTotalXpForLevel(level - 1);
  const nextLevelXp = getTotalXpForLevel(level);
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progress = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );
  const xpRemaining = nextLevelXp - currentXp;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon
              icon="heroicons:star-solid"
              className="text-2xl text-amber-300"
            />
          </div>
          <div>
            <p className="text-white/70 text-sm">Seviye</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-sm">Toplam XP</p>
          <p className="text-xl font-bold">{currentXp.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Seviye {level}</span>
          <span>Seviye {level + 1}</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-white/70">
            {xpInCurrentLevel.toLocaleString()} /{" "}
            {xpNeededForNextLevel.toLocaleString()} XP
          </span>
          <span className="text-amber-300 font-medium">
            {xpRemaining.toLocaleString()} XP kaldı
          </span>
        </div>
      </div>

      {/* Today's XP */}
      {todayXp > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:bolt" className="text-amber-300" />
            <span className="text-sm">Bugün kazanılan</span>
          </div>
          <span className="font-bold text-amber-300">+{todayXp} XP</span>
        </div>
      )}
    </div>
  );
}
