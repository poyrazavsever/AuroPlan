"use server";

import { createClient } from "@/utils/supabase/server";

// --- GLOBAL LEADERBOARD ---
export async function getGlobalLeaderboard(
  limit: number = 50,
  period: "all" | "weekly" | "monthly" = "all"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { users: [], currentUserRank: null };

  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, total_xp, level, weekly_xp, monthly_xp"
    )
    .order(
      period === "weekly"
        ? "weekly_xp"
        : period === "monthly"
        ? "monthly_xp"
        : "total_xp",
      { ascending: false }
    )
    .limit(limit);

  const { data: users, error } = await query;

  if (error) {
    console.error("Leaderboard getirilemedi:", error);
    return { users: [], currentUserRank: null };
  }

  // Kullanıcının sıralamasını bul
  const currentUserRank = users?.findIndex((u) => u.id === user.id) + 1 || null;

  // Eğer kullanıcı top 50'de değilse, ayrıca getir
  let currentUserData = null;
  if (!currentUserRank || currentUserRank > limit) {
    const { data: userData } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, avatar_url, total_xp, level, weekly_xp, monthly_xp"
      )
      .eq("id", user.id)
      .single();

    if (userData) {
      // Kullanıcının gerçek sıralamasını hesapla
      const xpField =
        period === "weekly"
          ? "weekly_xp"
          : period === "monthly"
          ? "monthly_xp"
          : "total_xp";
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt(xpField, userData[xpField] || 0);

      currentUserData = {
        ...userData,
        rank: (count || 0) + 1,
      };
    }
  }

  return {
    users: users?.map((u, i) => ({ ...u, rank: i + 1 })) || [],
    currentUserRank,
    currentUserData,
  };
}

// --- TAKIM LEADERBOARD ---
export async function getTeamLeaderboard(teamId: string, limit: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { members: [], currentUserRank: null };

  // Takım üyelerini XP'ye göre sırala
  const { data: members, error } = await supabase
    .from("team_members")
    .select(
      `
      user_id,
      role,
      joined_at,
      profiles:user_id(id, full_name, email, avatar_url, total_xp, level)
    `
    )
    .eq("team_id", teamId)
    .order("profiles(total_xp)", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Takım leaderboard getirilemedi:", error);
    return { members: [], currentUserRank: null };
  }

  // Düzleştir ve sırala
  const sortedMembers =
    members
      ?.map((m: any) => ({
        ...m.profiles,
        role: m.role,
        joined_at: m.joined_at,
      }))
      .sort((a: any, b: any) => (b.total_xp || 0) - (a.total_xp || 0))
      .map((m: any, i: number) => ({ ...m, rank: i + 1 })) || [];

  const currentUserRank =
    sortedMembers.findIndex((m: any) => m.id === user.id) + 1 || null;

  return { members: sortedMembers, currentUserRank };
}

// --- PROJE LEADERBOARD ---
export async function getProjectLeaderboard(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { members: [], currentUserRank: null };

  // Proje üyelerini XP'ye göre sırala
  const { data: members, error } = await supabase
    .from("project_members")
    .select(
      `
      user_id,
      role,
      profiles:user_id(id, full_name, email, avatar_url, total_xp, level)
    `
    )
    .eq("project_id", projectId);

  if (error) {
    console.error("Proje leaderboard getirilemedi:", error);
    return { members: [], currentUserRank: null };
  }

  // Düzleştir ve sırala
  const sortedMembers =
    members
      ?.map((m: any) => ({
        ...m.profiles,
        role: m.role,
      }))
      .sort((a: any, b: any) => (b.total_xp || 0) - (a.total_xp || 0))
      .map((m: any, i: number) => ({ ...m, rank: i + 1 })) || [];

  const currentUserRank =
    sortedMembers.findIndex((m: any) => m.id === user.id) + 1 || null;

  return { members: sortedMembers, currentUserRank };
}

// --- TAKIM SIRALAMASI (Takımlar arası) ---
export async function getTeamsLeaderboard(limit: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { teams: [], userTeamRanks: [] };

  // Tüm takımları getir ve üye XP toplamlarını hesapla
  const { data: teams, error } = await supabase.from("teams").select(`
      id,
      name,
      slug,
      created_at,
      team_members(
        profiles:user_id(total_xp)
      )
    `);

  if (error) {
    console.error("Takımlar leaderboard getirilemedi:", error);
    return { teams: [], userTeamRanks: [] };
  }

  // Takım XP toplamlarını hesapla ve sırala
  const teamsWithXp = teams
    ?.map((team: any) => {
      const totalXp = team.team_members?.reduce(
        (sum: number, m: any) => sum + (m.profiles?.total_xp || 0),
        0
      );
      const memberCount = team.team_members?.length || 0;
      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        totalXp,
        memberCount,
        avgXp: memberCount > 0 ? Math.round(totalXp / memberCount) : 0,
      };
    })
    .sort((a: any, b: any) => b.totalXp - a.totalXp)
    .slice(0, limit)
    .map((t: any, i: number) => ({ ...t, rank: i + 1 }));

  // Kullanıcının takımlarının sıralamalarını bul
  const { data: userMemberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  const userTeamIds = userMemberships?.map((m) => m.team_id) || [];
  const userTeamRanks = teamsWithXp
    ?.filter((t: any) => userTeamIds.includes(t.id))
    .map((t: any) => ({ teamId: t.id, rank: t.rank }));

  return { teams: teamsWithXp || [], userTeamRanks: userTeamRanks || [] };
}

// --- KULLANICI İSTATİSTİKLERİ ---
export async function getUserStats(userId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const targetUserId = userId || user.id;

  // Profil bilgileri
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (!profile) return null;

  // Kazanılan başarım sayısı
  const { count: achievementCount } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", targetUserId)
    .not("earned_at", "is", null);

  // Tamamlanan görev sayısı
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", targetUserId)
    .eq("status", "done");

  // Global sıralama
  const { count: rankCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("total_xp", profile.total_xp || 0);

  return {
    ...profile,
    achievementCount: achievementCount || 0,
    taskCount: taskCount || 0,
    globalRank: (rankCount || 0) + 1,
  };
}

// --- STREAK BİLGİSİ ---
export async function getUserStreak() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date")
    .eq("id", user.id)
    .single();

  return {
    currentStreak: profile?.current_streak || 0,
    longestStreak: profile?.longest_streak || 0,
    lastActiveDate: profile?.last_active_date || null,
  };
}

// --- AKTİVİTE GÜNCELLEME (Streak için) ---
export async function updateDailyActivity() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_active_date, current_streak, longest_streak")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false };

  const lastActive = profile.last_active_date;
  let newStreak = profile.current_streak || 0;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
      // Streak devam ediyor
      newStreak += 1;
    } else if (lastActive !== today) {
      // Streak kırıldı
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

    await supabase
      .from("profiles")
      .update({
        last_active_date: today,
        current_streak: newStreak,
        longest_streak: longestStreak,
      })
      .eq("id", user.id);
  }

  return { success: true, currentStreak: newStreak };
}
