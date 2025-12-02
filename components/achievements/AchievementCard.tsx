"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";

export default function AchievementCard({
  achievement,
  earnedAt,
}: {
  achievement: any;
  earnedAt?: string;
}) {
  const isEarned = !!earnedAt;

  return (
    <div
      className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 group
      ${
        isEarned
          ? "bg-white border-amber-200 shadow-lg shadow-amber-100/50 scale-100"
          : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0"
      }`}
    >
      {/* Rozet İkonu */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm relative overflow-hidden
        ${
          isEarned
            ? "bg-gradient-to-br from-amber-100 to-orange-100"
            : "bg-slate-200"
        }`}
      >
        {achievement.icon_url && achievement.icon_url.startsWith("http") ? (
          <Image
            src={achievement.icon_url}
            alt={achievement.title}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <span className="text-4xl">{achievement.icon_url || "🏆"}</span>
        )}
      </div>

      {/* Puan Rozeti */}
      <div
        className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
         ${
           isEarned
             ? "bg-amber-100 text-amber-700"
             : "bg-slate-200 text-slate-500"
         }`}
      >
        <Icon icon="heroicons:bolt" />
        {achievement.xp_value} XP
      </div>

      {/* İçerik */}
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {achievement.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        {achievement.description}
      </p>

      {/* Durum Göstergesi */}
      {isEarned ? (
        <div className="mt-auto pt-3 border-t border-amber-100 w-full">
          <p className="text-xs text-amber-600 font-bold flex items-center justify-center gap-1">
            <Icon icon="heroicons:check-badge" className="text-lg" />
            Kazanıldı: {new Date(earnedAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      ) : (
        <div className="mt-auto pt-3 border-t border-slate-200 w-full">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <Icon icon="heroicons:lock-closed" className="text-sm" />
            Henüz Kazanılmadı
          </p>
        </div>
      )}
    </div>
  );
}
