"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import CreateAchievementModal from "@/components/achievements/CreateAchievementModal";
import AwardAchievementModal from "@/components/achievements/AwardAchievementModal";
import { deleteAchievement } from "@/app/(dashboard)/dashboard/achievements/actions";
import toast from "react-hot-toast";

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    total_xp: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon: string;
  badge_color: string;
  xp_reward: number;
  trigger_type: string;
  is_active: boolean;
  user_achievements?: Array<{
    id: string;
    user_id: string;
    earned_at: string | null;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    };
  }>;
}

interface TeamAchievementsTabProps {
  teamId: string;
  achievements: Achievement[];
  isOwnerOrAdmin: boolean;
}

export default function TeamAchievementsTab({
  teamId,
  achievements,
  isOwnerOrAdmin,
}: TeamAchievementsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
      },
      red: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-600",
        border: "border-pink-200",
      },
      cyan: {
        bg: "bg-cyan-100",
        text: "text-cyan-600",
        border: "border-cyan-200",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        border: "border-orange-200",
      },
    };

  async function handleDelete(achievementId: string) {
    if (!confirm("Bu başarımı silmek istediğinize emin misiniz?")) return;

    setDeletingId(achievementId);
    try {
      const result = await deleteAchievement(achievementId);
      if (result.success) {
        toast.success("Başarım silindi.");
      } else {
        toast.error(result.error || "Başarım silinemedi.");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  function openAwardModal(achievement: Achievement) {
    setSelectedAchievement(achievement);
    setShowAwardModal(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Takım Başarımları
          </h2>
          <p className="text-sm text-slate-500">
            Takıma özel başarımlar oluşturun ve üyelere verin
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Icon icon="heroicons:plus" className="text-lg" />
            Yeni Başarım
          </button>
        )}
      </div>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center">
          <Icon
            icon="heroicons:trophy"
            className="text-5xl text-slate-300 mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium mb-2">
            Henüz başarım oluşturulmamış
          </p>
          <p className="text-slate-500 text-sm mb-4">
            Takım üyelerini motive etmek için özel başarımlar oluşturun
          </p>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Icon icon="heroicons:plus" />
              İlk Başarımı Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const colors = colorMap[achievement.badge_color] || colorMap.amber;
            const earnedCount =
              achievement.user_achievements?.filter((ua) => ua.earned_at)
                .length || 0;

            return (
              <div
                key={achievement.id}
                className={`bg-white rounded-2xl border ${colors.border} p-5 hover:shadow-md transition-shadow`}
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}
                  >
                    <Icon
                      icon={achievement.icon}
                      className={`text-2xl ${colors.text}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">
                      {achievement.title}
                    </h3>
                    {achievement.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-600 font-medium">
                    <Icon icon="heroicons:bolt" />
                    {achievement.xp_reward} XP
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Icon icon="heroicons:users" />
                    {earnedCount} kazanmış
                  </div>
                </div>

                {/* Earned Avatars */}
                {earnedCount > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {achievement.user_achievements
                      ?.filter((ua) => ua.earned_at)
                      .slice(0, 5)
                      .map((ua) => (
                        <div
                          key={ua.id}
                          className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden"
                          title={ua.profiles?.full_name || ua.profiles?.email}
                        >
                          {ua.profiles?.avatar_url ? (
                            <Image
                              src={ua.profiles.avatar_url}
                              alt="avatar"
                              width={32}
                              height={32}
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              {ua.profiles?.full_name?.[0] ||
                                ua.profiles?.email?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    {earnedCount > 5 && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">
                          +{earnedCount - 5}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions (Owner/Admin only) */}
                {isOwnerOrAdmin && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openAwardModal(achievement)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Icon icon="heroicons:gift" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      disabled={deletingId === achievement.id}
                      className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === achievement.id ? (
                        <Icon
                          icon="heroicons:arrow-path"
                          className="text-lg animate-spin"
                        />
                      ) : (
                        <Icon icon="heroicons:trash" className="text-lg" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateAchievementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        scope="team"
        scopeId={teamId}
      />

      {selectedAchievement && (
        <AwardAchievementModal
          isOpen={showAwardModal}
          onClose={() => {
            setShowAwardModal(false);
            setSelectedAchievement(null);
          }}
          scope="team"
          scopeId={teamId}
          achievement={selectedAchievement}
        />
      )}
    </div>
  );
}
