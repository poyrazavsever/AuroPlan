"use client";

import { useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import type { Achievement } from "@/types/supabase";

// Badge renk eşlemesi
const badgeColors: Record<string, { bg: string; text: string }> = {
  amber: { bg: "bg-amber-500", text: "text-white" },
  blue: { bg: "bg-blue-500", text: "text-white" },
  green: { bg: "bg-green-500", text: "text-white" },
  red: { bg: "bg-red-500", text: "text-white" },
  purple: { bg: "bg-purple-500", text: "text-white" },
};

// Konfeti efekti
export function fireConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Başarım toast bildirimi
export function showAchievementToast(achievement: Achievement) {
  const colors = badgeColors[achievement.badge_color] || badgeColors.amber;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* İkon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} shadow-lg`}
            >
              <Icon icon={achievement.icon} className="text-2xl" />
            </div>

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                  🎉 Yeni Başarım!
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {achievement.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {achievement.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                  <Icon icon="heroicons:sparkles" className="text-sm" />+
                  {achievement.xp_reward} XP
                </span>
              </div>
            </div>

            {/* Kapat butonu */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Icon icon="heroicons:x-mark" className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Alt kısım - Başarımları gör linki */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100">
          <a
            href="/dashboard/achievements"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Tüm başarımları gör
            <Icon icon="heroicons:arrow-right" className="text-xs" />
          </a>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
    }
  );

  // Konfeti efekti
  fireConfetti();
}

// Hook: Başarım bildirimi göster
export function useAchievementNotification() {
  const notify = useCallback((achievements: Achievement[]) => {
    if (!achievements || achievements.length === 0) return;

    // Her başarım için ayrı toast göster (kısa aralıklarla)
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        showAchievementToast(achievement);
      }, index * 1000); // Her biri için 1 saniye arayla
    });
  }, []);

  return { notify };
}

// Bileşen: Sayfa yüklendiğinde başarımları kontrol et
type Props = {
  achievements?: Achievement[];
};

export default function AchievementNotifier({ achievements }: Props) {
  const { notify } = useAchievementNotification();

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      notify(achievements);
    }
  }, [achievements, notify]);

  return null; // Bu bileşen görsel çıktı üretmez
}
