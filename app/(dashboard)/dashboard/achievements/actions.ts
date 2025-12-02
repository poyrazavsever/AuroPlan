"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Achievement, AchievementWithProgress } from "@/types/supabase";

// --- BAŞARIMLARI GETIR ---
export async function getAchievements(
  scope: "global" | "team" | "project" = "global",
  scopeId?: string
): Promise<AchievementWithProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Başarımları çek
  let query = supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (scope === "global") {
    query = query.eq("scope", "global");
  } else if (scope === "team" && scopeId) {
    query = query.eq("scope", "team").eq("team_id", scopeId);
  } else if (scope === "project" && scopeId) {
    query = query.eq("scope", "project").eq("project_id", scopeId);
  }

  const { data: achievements, error } = await query;

  if (error || !achievements) {
    console.error("Achievements fetch error:", error);
    return [];
  }

  // Kullanıcının ilerleme durumunu çek
  const { data: userProgress } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id);

  const progressMap = new Map(
    userProgress?.map((p) => [p.achievement_id, p]) || []
  );

  // Başarımları ilerleme ile birleştir
  const achievementsWithProgress: AchievementWithProgress[] = achievements.map(
    (achievement) => {
      const progress = progressMap.get(achievement.id);
      return {
        ...achievement,
        user_progress: progress
          ? {
              progress: progress.progress,
              progress_max: progress.progress_max,
              earned_at:
                progress.progress >= progress.progress_max
                  ? progress.earned_at
                  : null,
              xp_awarded: progress.xp_awarded,
            }
          : null,
      };
    }
  );

  return achievementsWithProgress;
}

// --- KULLANICI İSTATİSTİKLERİ ---
export async function getUserAchievementStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Toplam başarım sayısı
  const { count: totalAchievements } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .eq("scope", "global")
    .eq("is_active", true);

  // Kazanılan başarım sayısı
  const { data: earnedAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, progress, progress_max")
    .eq("user_id", user.id);

  const earnedCount =
    earnedAchievements?.filter((a) => a.progress >= a.progress_max).length || 0;

  // Toplam kazanılan XP (başarımlardan)
  const { data: xpData } = await supabase
    .from("user_achievements")
    .select("xp_awarded")
    .eq("user_id", user.id);

  const totalXpFromAchievements =
    xpData?.reduce((sum, a) => sum + (a.xp_awarded || 0), 0) || 0;

  return {
    total: totalAchievements || 0,
    earned: earnedCount,
    totalXpFromAchievements,
    completionRate: totalAchievements
      ? Math.round((earnedCount / totalAchievements) * 100)
      : 0,
  };
}

// --- BAŞARIM ÖDÜLLENDIR ---
export async function awardAchievement(achievementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Oturum açmanız gerekiyor." };
  }

  // Veritabanı fonksiyonunu çağır
  const { data, error } = await supabase.rpc("award_achievement", {
    p_user_id: user.id,
    p_achievement_id: achievementId,
  });

  if (error) {
    console.error("Award achievement error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/achievements");
  revalidatePath("/dashboard");

  return { success: data, awarded: data };
}

// --- İLERLEME GÜNCELLE ---
export async function updateAchievementProgress(
  achievementId: string,
  increment: number = 1
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Oturum açmanız gerekiyor." };
  }

  const { data, error } = await supabase.rpc("update_achievement_progress", {
    p_user_id: user.id,
    p_achievement_id: achievementId,
    p_increment: increment,
  });

  if (error) {
    console.error("Update progress error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/achievements");

  return data;
}

// --- BAŞARIM KONTROLÜ (Tetikleme tipine göre) ---
export async function checkAndAwardAchievements(
  triggerType: string,
  _context?: {
    taskPriority?: string;
    projectId?: string;
    learningId?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const awardedAchievements: Achievement[] = [];

  // Profil bilgisini al
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, level")
    .eq("id", user.id)
    .single();

  // İlgili başarımları bul
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .eq("scope", "global");

  if (!achievements) return [];

  for (const achievement of achievements) {
    // Zaten kazanılmış mı kontrol et
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("progress, progress_max")
      .eq("user_id", user.id)
      .eq("achievement_id", achievement.id)
      .single();

    if (existing && existing.progress >= existing.progress_max) {
      continue; // Zaten kazanılmış
    }

    let shouldUpdate = false;
    let shouldAward = false;

    switch (achievement.trigger_type) {
      case "task_complete":
        if (triggerType === "task_complete") {
          shouldUpdate = true;
        }
        break;

      case "project_complete":
        if (triggerType === "project_complete") {
          shouldUpdate = true;
        }
        break;

      case "learning_complete":
        if (triggerType === "learning_complete") {
          shouldUpdate = true;
        }
        break;

      case "level_threshold":
        if (profile && profile.level >= achievement.trigger_value) {
          shouldAward = true;
        }
        break;

      case "xp_threshold":
        if (profile && profile.total_xp >= achievement.trigger_value) {
          shouldAward = true;
        }
        break;

      case "count_based":
        if (triggerType === achievement.category) {
          shouldUpdate = true;
        }
        break;
    }

    if (shouldAward) {
      const result = await awardAchievement(achievement.id);
      if (result.awarded) {
        awardedAchievements.push(achievement);
      }
    } else if (shouldUpdate) {
      const result = await updateAchievementProgress(achievement.id, 1);
      if (result && result.just_completed) {
        awardedAchievements.push(achievement);
      }
    }
  }

  return awardedAchievements;
}

// --- GÖREV SAYISINI GÜNCELLE VE BAŞARIMLARI KONTROL ET ---
export async function onTaskComplete(taskPriority?: string) {
  const awarded = await checkAndAwardAchievements("task_complete", {
    taskPriority,
  });

  // Count-based başarımları da kontrol et
  const countAwards = await checkAndAwardAchievements("tasks");

  return [...awarded, ...countAwards];
}

// --- PROJE TAMAMLANDIĞINDA ---
export async function onProjectComplete(projectId: string) {
  const awarded = await checkAndAwardAchievements("project_complete", {
    projectId,
  });

  const countAwards = await checkAndAwardAchievements("projects");

  return [...awarded, ...countAwards];
}

// --- ÖĞRENME TAMAMLANDIĞINDA ---
export async function onLearningComplete(learningId: string) {
  const awarded = await checkAndAwardAchievements("learning_complete", {
    learningId,
  });

  const countAwards = await checkAndAwardAchievements("learning");

  return [...awarded, ...countAwards];
}

// ============================================
// FAZ 2: TAKIM & PROJE BAŞARIMLARI YÖNETİMİ
// ============================================

// --- TAKIM BAŞARIMLARINI GETİR ---
export async function getTeamAchievements(teamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { achievements: [], error: "Oturum açmanız gerekiyor." };

  // Önce başarımları getir
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("team_id", teamId)
    .eq("scope", "team")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Takım başarımları getirilemedi:", error);
    return { achievements: [], error: error.message };
  }

  if (!achievements || achievements.length === 0) {
    return { achievements: [], error: null };
  }

  // Her başarım için user_achievements'ı ayrı çek
  const achievementsWithUsers = await Promise.all(
    achievements.map(async (achievement) => {
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select(
          `
          id,
          user_id,
          earned_at,
          progress,
          xp_awarded
        `
        )
        .eq("achievement_id", achievement.id);

      // Kullanıcı bilgilerini ayrı çek
      const userAchievementsWithProfiles = await Promise.all(
        (userAchievements || []).map(async (ua) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", ua.user_id)
            .single();
          return { ...ua, profiles: profile };
        })
      );

      return {
        ...achievement,
        user_achievements: userAchievementsWithProfiles,
      };
    })
  );

  return { achievements: achievementsWithUsers, error: null };
}

// --- PROJE BAŞARIMLARINI GETİR ---
export async function getProjectAchievements(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { achievements: [], error: "Oturum açmanız gerekiyor." };

  // Önce başarımları getir
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("project_id", projectId)
    .eq("scope", "project")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Proje başarımları getirilemedi:", error);
    return { achievements: [], error: error.message };
  }

  if (!achievements || achievements.length === 0) {
    return { achievements: [], error: null };
  }

  // Her başarım için user_achievements'ı ayrı çek
  const achievementsWithUsers = await Promise.all(
    achievements.map(async (achievement) => {
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select(
          `
          id,
          user_id,
          earned_at,
          progress,
          xp_awarded
        `
        )
        .eq("achievement_id", achievement.id);

      // Kullanıcı bilgilerini ayrı çek
      const userAchievementsWithProfiles = await Promise.all(
        (userAchievements || []).map(async (ua) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", ua.user_id)
            .single();
          return { ...ua, profiles: profile };
        })
      );

      return {
        ...achievement,
        user_achievements: userAchievementsWithProfiles,
      };
    })
  );

  return { achievements: achievementsWithUsers, error: null };
}

// --- TAKIM BAŞARIMI OLUŞTUR ---
export async function createTeamAchievement(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Oturum açmanız gerekiyor." };

  const teamId = formData.get("teamId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const badgeColor = formData.get("badgeColor") as string;
  const xpReward = parseInt(formData.get("xpReward") as string) || 50;
  const category = (formData.get("category") as string) || "general";
  const triggerType = (formData.get("triggerType") as string) || "manual";
  const triggerValue = parseInt(formData.get("triggerValue") as string) || 1;

  if (!teamId || !title) {
    return { success: false, error: "Takım ID ve başlık zorunludur." };
  }

  // Yetki kontrolü: Takım owner veya admin olmalı
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  const { data, error } = await supabase
    .from("achievements")
    .insert({
      scope: "team",
      team_id: teamId,
      title,
      description: description || "",
      icon: icon || "heroicons:trophy",
      badge_color: badgeColor || "amber",
      xp_reward: xpReward,
      category,
      trigger_type: triggerType,
      trigger_value: triggerValue,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Takım başarımı oluşturulamadı:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/team");
  return { success: true, achievement: data };
}

// --- PROJE BAŞARIMI OLUŞTUR ---
export async function createProjectAchievement(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Oturum açmanız gerekiyor." };

  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const badgeColor = formData.get("badgeColor") as string;
  const xpReward = parseInt(formData.get("xpReward") as string) || 50;
  const category = (formData.get("category") as string) || "general";
  const triggerType = (formData.get("triggerType") as string) || "manual";
  const triggerValue = parseInt(formData.get("triggerValue") as string) || 1;

  if (!projectId || !title) {
    return { success: false, error: "Proje ID ve başlık zorunludur." };
  }

  // Yetki kontrolü: Proje owner veya manager olmalı
  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  const { data, error } = await supabase
    .from("achievements")
    .insert({
      scope: "project",
      project_id: projectId,
      title,
      description: description || "",
      icon: icon || "heroicons:trophy",
      badge_color: badgeColor || "blue",
      xp_reward: xpReward,
      category,
      trigger_type: triggerType,
      trigger_value: triggerValue,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Proje başarımı oluşturulamadı:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, achievement: data };
}

// --- KULLANICIYA BAŞARIM VER (MANUEL) ---
export async function awardAchievementToUser(
  achievementId: string,
  targetUserId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Oturum açmanız gerekiyor." };

  // Başarımı getir
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", achievementId)
    .single();

  if (!achievement) {
    return { success: false, error: "Başarım bulunamadı." };
  }

  // Yetki kontrolü
  if (achievement.scope === "team" && achievement.team_id) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", achievement.team_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }

    // Hedef kullanıcı takımda mı?
    const { data: targetMembership } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", achievement.team_id)
      .eq("user_id", targetUserId)
      .single();

    if (!targetMembership) {
      return { success: false, error: "Kullanıcı bu takımda değil." };
    }
  } else if (achievement.scope === "project" && achievement.project_id) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", achievement.project_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "manager"].includes(membership.role)) {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }

    // Hedef kullanıcı projede mi?
    const { data: targetMembership } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", achievement.project_id)
      .eq("user_id", targetUserId)
      .single();

    if (!targetMembership) {
      return { success: false, error: "Kullanıcı bu projede değil." };
    }
  }

  // Zaten kazanmış mı?
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("achievement_id", achievementId)
    .not("earned_at", "is", null)
    .single();

  if (existing) {
    return { success: false, error: "Kullanıcı bu başarımı zaten kazanmış." };
  }

  // Başarımı ver
  const { error } = await supabase.from("user_achievements").upsert(
    {
      user_id: targetUserId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString(),
      progress: 1,
      progress_max: 1,
      xp_awarded: achievement.xp_reward,
    },
    { onConflict: "user_id,achievement_id" }
  );

  if (error) {
    console.error("Başarım verilemedi:", error);
    return { success: false, error: error.message };
  }

  // XP ekle
  await supabase.rpc("add_xp", {
    user_id_param: targetUserId,
    amount: achievement.xp_reward,
  });

  if (achievement.team_id) {
    revalidatePath("/dashboard/team");
  }
  if (achievement.project_id) {
    revalidatePath(`/dashboard/projects/${achievement.project_id}`);
  }

  return { success: true };
}

// --- BAŞARIM SİL ---
export async function deleteAchievement(achievementId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Oturum açmanız gerekiyor." };

  // Başarımı getir
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", achievementId)
    .single();

  if (!achievement) {
    return { success: false, error: "Başarım bulunamadı." };
  }

  // Yetki kontrolü
  if (achievement.scope === "team" && achievement.team_id) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", achievement.team_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }
  } else if (achievement.scope === "project" && achievement.project_id) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", achievement.project_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "manager"].includes(membership.role)) {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }
  } else if (achievement.scope === "global") {
    return { success: false, error: "Global başarımlar silinemez." };
  }

  // Önce user_achievements'ı sil
  await supabase
    .from("user_achievements")
    .delete()
    .eq("achievement_id", achievementId);

  // Sonra başarımı sil
  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", achievementId);

  if (error) {
    console.error("Başarım silinemedi:", error);
    return { success: false, error: error.message };
  }

  if (achievement.team_id) {
    revalidatePath("/dashboard/team");
  }
  if (achievement.project_id) {
    revalidatePath(`/dashboard/projects/${achievement.project_id}`);
  }

  return { success: true };
}

// --- TAKIM ÜYELERİNİ GETİR (Başarım vermek için) ---
export async function getTeamMembersForAward(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      user_id,
      role,
      profiles:user_id(id, full_name, email, avatar_url)
    `
    )
    .eq("team_id", teamId);

  if (error) {
    console.error("Takım üyeleri getirilemedi:", error);
    return [];
  }

  return data || [];
}

// --- PROJE ÜYELERİNİ GETİR (Başarım vermek için) ---
export async function getProjectMembersForAward(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      user_id,
      role,
      profiles:user_id(id, full_name, email, avatar_url)
    `
    )
    .eq("project_id", projectId);

  if (error) {
    console.error("Proje üyeleri getirilemedi:", error);
    return [];
  }

  return data || [];
}
