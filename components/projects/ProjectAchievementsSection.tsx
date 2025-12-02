"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import CreateAchievementModal from "@/components/achievements/CreateAchievementModal";
import AwardAchievementModal from "@/components/achievements/AwardAchievementModal";
import { deleteAchievement } from "@/app/(dashboard)/dashboard/achievements/actions";
import toast from "react-hot-toast";

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

interface ProjectAchievementsSectionProps {
  projectId: string;
  achievements: Achievement[];
  canManage: boolean;
}

export default function ProjectAchievementsSection({
  projectId,
  achievements,
  canManage,
}: ProjectAchievementsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const colorMap: Record<string, { bg: string; text: string }> = {
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    pink: { bg: "bg-pink-100", text: "text-pink-600" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
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

  const displayedAchievements = isExpanded
    ? achievements
    : achievements.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Icon icon="heroicons:trophy" className="text-amber-500" />
          Proje Başarımları
        </h3>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Yeni Başarım"
          >
            <Icon icon="heroicons:plus" className="text-lg" />
          </button>
        )}
      </div>

      {/* Achievements List */}
      {achievements.length === 0 ? (
        <div className="text-center py-6">
          <Icon
            icon="heroicons:trophy"
            className="text-3xl text-slate-300 mx-auto mb-2"
          />
          <p className="text-sm text-slate-500">
            {canManage
              ? "Henüz başarım yok. Ekibi motive edin!"
              : "Henüz proje başarımı yok."}
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-sm text-blue-600 hover:underline font-medium"
            >
              İlk başarımı oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAchievements.map((achievement) => {
            const colors = colorMap[achievement.badge_color] || colorMap.amber;
            const earnedCount =
              achievement.user_achievements?.filter((ua) => ua.earned_at)
                .length || 0;

            return (
              <div
                key={achievement.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}
                >
                  <Icon
                    icon={achievement.icon}
                    className={`text-xl ${colors.text}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {achievement.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Icon icon="heroicons:bolt" />
                      {achievement.xp_reward}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:users" />
                      {earnedCount}
                    </span>
                  </div>

                  {/* Earned Avatars */}
                  {earnedCount > 0 && (
                    <div className="flex -space-x-1 mt-2">
                      {achievement.user_achievements
                        ?.filter((ua) => ua.earned_at)
                        .slice(0, 4)
                        .map((ua) => (
                          <div
                            key={ua.id}
                            className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center overflow-hidden"
                            title={ua.profiles?.full_name || ua.profiles?.email}
                          >
                            {ua.profiles?.avatar_url ? (
                              <Image
                                src={ua.profiles.avatar_url}
                                alt="avatar"
                                width={24}
                                height={24}
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">
                                {ua.profiles?.full_name?.[0] ||
                                  ua.profiles?.email?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                      {earnedCount > 4 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-500">
                            +{earnedCount - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openAwardModal(achievement)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Başarım Ver"
                    >
                      <Icon icon="heroicons:gift" className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      disabled={deletingId === achievement.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Sil"
                    >
                      {deletingId === achievement.id ? (
                        <Icon
                          icon="heroicons:arrow-path"
                          className="text-sm animate-spin"
                        />
                      ) : (
                        <Icon icon="heroicons:trash" className="text-sm" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show More */}
          {achievements.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center text-sm text-blue-600 hover:underline font-medium py-2"
            >
              {isExpanded
                ? "Daha az göster"
                : `Tümünü göster (${achievements.length})`}
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateAchievementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        scope="project"
        scopeId={projectId}
      />

      {selectedAchievement && (
        <AwardAchievementModal
          isOpen={showAwardModal}
          onClose={() => {
            setShowAwardModal(false);
            setSelectedAchievement(null);
          }}
          scope="project"
          scopeId={projectId}
          achievement={selectedAchievement}
        />
      )}
    </div>
  );
}
