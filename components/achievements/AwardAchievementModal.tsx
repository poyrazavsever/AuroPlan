"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  awardAchievementToUser,
  getTeamMembersForAward,
  getProjectMembersForAward,
} from "@/app/(dashboard)/dashboard/achievements/actions";
import toast from "react-hot-toast";
import Image from "next/image";

interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon: string;
  badge_color: string;
  xp_reward: number;
  user_achievements?: Array<{
    user_id: string;
    earned_at: string | null;
  }>;
}

interface Member {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface AwardAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: "team" | "project";
  scopeId: string;
  achievement: Achievement;
}

export default function AwardAchievementModal({
  isOpen,
  onClose,
  scope,
  scopeId,
  achievement,
}: AwardAchievementModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Başarımı zaten kazanmış kullanıcılar
  const earnedUserIds =
    achievement.user_achievements
      ?.filter((ua) => ua.earned_at)
      .map((ua) => ua.user_id) || [];

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, scope, scopeId]);

  async function loadMembers() {
    setIsLoading(true);
    try {
      const data =
        scope === "team"
          ? await getTeamMembersForAward(scopeId)
          : await getProjectMembersForAward(scopeId);
      setMembers(data as unknown as Member[]);
    } catch (error) {
      console.error("Üyeler yüklenemedi:", error);
      toast.error("Üyeler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }

  // Kazanmamış üyeleri filtrele
  const availableMembers = members.filter(
    (m) => !earnedUserIds.includes(m.user_id)
  );

  // Arama filtresi
  const filteredMembers = availableMembers.filter((m) => {
    const name = m.profiles.full_name?.toLowerCase() || "";
    const email = m.profiles.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function selectAll() {
    setSelectedUsers(filteredMembers.map((m) => m.user_id));
  }

  function deselectAll() {
    setSelectedUsers([]);
  }

  async function handleAward() {
    if (selectedUsers.length === 0) {
      toast.error("En az bir kullanıcı seçin.");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedUsers) {
      try {
        const result = await awardAchievementToUser(achievement.id, userId);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Kullanıcı ${userId}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Kullanıcı ${userId} için hata:`, error);
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast.success(
        `${successCount} kullanıcıya başarım verildi!${
          errorCount > 0 ? ` (${errorCount} hata)` : ""
        }`
      );
      onClose();
    } else {
      toast.error("Başarım verilemedi.");
    }
  }

  if (!isOpen) return null;

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

  const colors = colorMap[achievement.badge_color] || colorMap.amber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Başarım Ver</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon icon="heroicons:x-mark" className="text-xl" />
          </button>
        </div>

        {/* Achievement Info */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}
            >
              <Icon
                icon={achievement.icon}
                className={`text-2xl ${colors.text}`}
              />
            </div>
            <div>
              <p className="font-bold text-slate-900">{achievement.title}</p>
              {achievement.description && (
                <p className="text-sm text-slate-500 line-clamp-1">
                  {achievement.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium mt-0.5">
                <Icon icon="heroicons:bolt" />
                {achievement.xp_reward} XP
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon
                icon="heroicons:arrow-path"
                className="text-3xl text-slate-400 animate-spin"
              />
            </div>
          ) : availableMembers.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                icon="heroicons:check-circle"
                className="text-5xl text-green-400 mx-auto mb-3"
              />
              <p className="text-slate-600 font-medium">
                Tüm üyeler bu başarımı kazanmış!
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Üye ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Select All / Deselect */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">
                  {selectedUsers.length} / {filteredMembers.length} seçili
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.user_id}
                    type="button"
                    onClick={() => toggleUser(member.user_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedUsers.includes(member.user_id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100">
                      {member.profiles.avatar_url ? (
                        <Image
                          src={member.profiles.avatar_url}
                          alt="avatar"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">
                          {member.profiles.full_name?.[0] ||
                            member.profiles.email[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900 text-sm">
                        {member.profiles.full_name || "İsimsiz Kullanıcı"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member.profiles.email}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedUsers.includes(member.user_id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedUsers.includes(member.user_id) && (
                        <Icon
                          icon="heroicons:check"
                          className="text-white text-sm"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredMembers.length === 0 && searchQuery && (
                <p className="text-center text-slate-500 py-8">
                  &quot;{searchQuery}&quot; ile eşleşen üye bulunamadı.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {availableMembers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleAward}
              disabled={isSubmitting || selectedUsers.length === 0}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="text-lg animate-spin"
                  />
                  Veriliyor...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:gift" className="text-lg" />
                  Başarım Ver ({selectedUsers.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
