"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeLearning(learningId: string, xpPoints: number) {
  const supabase = await createClient();

  // Kullanıcıyı al
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 1. İlerlemeyi Kaydet (User Progress)
  const { error: progressError } = await supabase.from("user_progress").insert({
    user_id: user.id,
    learning_id: learningId,
    completed_at: new Date().toISOString(),
  });

  if (progressError) {
    console.error("Progress error:", progressError);
    return;
  }

  // 2. Kullanıcının Toplam Puanını (XP) Artır (RPC veya direct update)
  // Basitlik için önce mevcut puanı okuyup sonra artırıyoruz.
  // Not: Yoğun sistemlerde Supabase RPC (Stored Procedure) kullanmak daha atomic olur.

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  const newXp = (profile?.total_xp || 0) + xpPoints;

  await supabase.from("profiles").update({ total_xp: newXp }).eq("id", user.id);

  revalidatePath("/dashboard/learn");
  revalidatePath("/dashboard"); // Sidebar veya Header'da XP gösteriyorsak orayı da günceller
}
