"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- 1. ÖZEL BAŞARIM OLUŞTURMA (Yöneticiler İçin) ---
export async function createCustomAchievement(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum açmanız gerekiyor.");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const xpValue = parseInt(formData.get("xp") as string) || 50;
  const scope = formData.get("scope") as "team" | "project";
  const targetId = formData.get("targetId") as string; // TeamID veya ProjectID
  const iconFile = formData.get("icon") as File;

  if (!title || !targetId || !iconFile) throw new Error("Eksik bilgi.");

  // 1. Görseli Yükle
  const fileExt = iconFile.name.split(".").pop();
  const fileName = `badge_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from("badges")
    .upload(fileName, iconFile);

  if (uploadError) throw new Error("Görsel yüklenemedi.");

  const {
    data: { publicUrl },
  } = supabase.storage.from("badges").getPublicUrl(fileName);

  // 2. Kaydı Oluştur
  const { error } = await supabase.from("achievements").insert({
    title,
    description,
    xp_value: xpValue,
    scope,
    team_id: scope === "team" ? targetId : null,
    project_id: scope === "project" ? targetId : null,
    icon_url: publicUrl,
    created_by: user.id,
  });

  if (error) {
    console.error(error);
    throw new Error("Başarım oluşturulamadı.");
  }

  revalidatePath("/dashboard/achievements");
}

// --- 2. BAŞARIM VERME (Awarding) ---
export async function awardAchievement(userId: string, achievementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Yetkisiz işlem.");

  // 1. Başarımın detaylarını ve XP değerini al
  const { data: achievement } = await supabase
    .from("achievements")
    .select("xp_value")
    .eq("id", achievementId)
    .single();

  if (!achievement) throw new Error("Başarım bulunamadı.");

  // 2. Kullanıcıya Ata
  const { error } = await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_id: achievementId,
    awarded_by: user.id,
  });

  if (error) {
    if (error.code === "23505")
      throw new Error("Kullanıcı bu başarıma zaten sahip.");
    throw new Error("Atama yapılamadı.");
  }

  // 3. Kullanıcının Total XP'sini Güncelle
  const { error: xpError } = await supabase.rpc("increment_xp", {
    x: achievement.xp_value,
    row_id: userId,
  });

  // RPC (Stored Procedure) yoksa manuel update yapalım:
  if (xpError) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();
    await supabase
      .from("profiles")
      .update({ total_xp: (profile?.total_xp || 0) + achievement.xp_value })
      .eq("id", userId);
  }

  revalidatePath("/dashboard/achievements");
}

// --- 3. SİSTEM BAŞARIMI KONTROLÜ (Otomasyon İçin) ---
export async function checkAndAwardSystemAchievement(
  userId: string,
  code: string
) {
  const supabase = await createClient();

  // 1. İlgili sistem başarımını bul
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id, xp_value")
    .eq("scope", "system")
    .eq("system_code", code)
    .single();

  if (!achievement) return; // Böyle bir başarım tanımlı değil

  // 2. Zaten alınmış mı kontrol et
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_id", achievement.id)
    .single();

  if (existing) return; // Zaten almış

  // 3. Ver
  await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_id: achievement.id,
  });

  // 4. XP Ekle
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();
  await supabase
    .from("profiles")
    .update({ total_xp: (profile?.total_xp || 0) + achievement.xp_value })
    .eq("id", userId);
}
