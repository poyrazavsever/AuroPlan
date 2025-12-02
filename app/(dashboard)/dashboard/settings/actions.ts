"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- KULLANICI AYARLARINI GETİR ---
export async function getUserSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Varsayılan ayarlar
  const defaultSettings = {
    // Bildirimler
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    achievement_notifications: true,
    team_updates: true,
    weekly_digest: true,

    // Görünüm
    theme: "light" as "light" | "dark" | "system",
    language: "tr",
    date_format: "DD/MM/YYYY",
    time_format: "24h",

    // Gizlilik
    profile_visibility: "team" as "public" | "team" | "private",
    show_activity: true,
    show_achievements: true,
    show_xp: true,

    // Gamification
    show_leaderboard_rank: true,
    streak_reminders: true,
  };

  return settings || defaultSettings;
}

// --- BİLDİRİM AYARLARINI GÜNCELLE ---
export async function updateNotificationSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const settings = {
    email_notifications: formData.get("email_notifications") === "on",
    push_notifications: formData.get("push_notifications") === "on",
    task_reminders: formData.get("task_reminders") === "on",
    achievement_notifications:
      formData.get("achievement_notifications") === "on",
    team_updates: formData.get("team_updates") === "on",
    weekly_digest: formData.get("weekly_digest") === "on",
    streak_reminders: formData.get("streak_reminders") === "on",
  };

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    ...settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Bildirim ayarları güncellenemedi:", error);
    throw new Error("Ayarlar kaydedilemedi");
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// --- GÖRÜNÜM AYARLARINI GÜNCELLE ---
export async function updateAppearanceSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const settings = {
    theme: formData.get("theme") as string,
    language: formData.get("language") as string,
    date_format: formData.get("date_format") as string,
    time_format: formData.get("time_format") as string,
  };

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    ...settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Görünüm ayarları güncellenemedi:", error);
    throw new Error("Ayarlar kaydedilemedi");
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// --- GİZLİLİK AYARLARINI GÜNCELLE ---
export async function updatePrivacySettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const settings = {
    profile_visibility: formData.get("profile_visibility") as string,
    show_activity: formData.get("show_activity") === "on",
    show_achievements: formData.get("show_achievements") === "on",
    show_xp: formData.get("show_xp") === "on",
    show_leaderboard_rank: formData.get("show_leaderboard_rank") === "on",
  };

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    ...settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Gizlilik ayarları güncellenemedi:", error);
    throw new Error("Ayarlar kaydedilemedi");
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// --- ŞİFRE DEĞİŞTİR ---
export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (newPassword !== confirmPassword) {
    throw new Error("Şifreler eşleşmiyor");
  }

  if (newPassword.length < 8) {
    throw new Error("Şifre en az 8 karakter olmalı");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Şifre değiştirilemedi:", error);
    throw new Error("Şifre değiştirilemedi");
  }

  return { success: true };
}

// --- HESABI SİL ---
export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  // Kullanıcının verilerini sil (cascade ile otomatik silinir)
  // Önce profil ve ayarları sil
  await supabase.from("user_settings").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  // Auth kullanıcısını sil (admin API gerektirir, şimdilik devre dışı bırakılır)
  // Not: Gerçek silme için Supabase Edge Function veya server-side admin client gerekir

  return { success: true, message: "Hesap silme talebi alındı" };
}

// --- OTURUMLARI GETİR ---
export async function getActiveSessions() {
  // Not: Supabase bu özelliği doğrudan desteklemiyor
  // Gelecekte session management eklenebilir
  return [];
}

// --- DIŞA AKTAR ---
export async function exportUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  // Kullanıcının tüm verilerini topla
  const [profile, tasks, achievements, settings] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("tasks").select("*").eq("assigned_to", user.id),
    supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
  ]);

  return {
    profile: profile.data,
    tasks: tasks.data,
    achievements: achievements.data,
    settings: settings.data,
    exported_at: new Date().toISOString(),
  };
}
