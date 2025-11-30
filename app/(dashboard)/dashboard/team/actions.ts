"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMember(formData: FormData) {
  const supabase = await createClient();

  // 1. Yetki Kontrolü
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açmanız gerekiyor.");

  const email = formData.get("email") as string;
  const teamId = formData.get("teamId") as string;

  if (!email || !teamId) throw new Error("E-posta ve Takım ID zorunludur.");

  // 2. İşlemi yapan kişinin yetkisini kontrol et (Owner veya Admin mi?)
  const { data: currentUserRole } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
    throw new Error("Üye ekleme yetkiniz yok.");
  }

  // 3. Eklenecek kullanıcıyı bul (Profiles tablosundan)
  // Not: Gerçek bir SaaS'ta burada e-posta davetiye servisi (Resend/SendGrid) kullanılır.
  // MVP için sadece sisteme kayıtlı kullanıcıları ekliyoruz.
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!targetUser) {
    throw new Error(
      "Kullanıcı bulunamadı. Lütfen önce sisteme kayıt olmasını isteyin."
    );
  }

  // 4. Kullanıcı zaten takımda mı?
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", targetUser.id)
    .single();

  if (existingMember) {
    throw new Error("Bu kullanıcı zaten takımda.");
  }

  // 5. Üyeyi Ekle
  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: targetUser.id,
    role: "member",
  });

  if (error) {
    console.error("Add Member Error:", error);
    throw new Error("Üye eklenirken bir hata oluştu.");
  }

  revalidatePath("/dashboard/team");
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();

  const memberId = formData.get("memberId") as string; // team_members tablosundaki ID
  if (!memberId) return;

  // RLS (Row Level Security) politikaları zaten yetki kontrolünü yapar ama
  // sunucu tarafında ekstra güvenlik iyidir.

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw new Error("Üye çıkarılamadı.");
  }

  revalidatePath("/dashboard/team");
}
