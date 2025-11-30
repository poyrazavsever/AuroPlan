import { createClient } from "@/utils/supabase/server";
import LearningCard from "@/components/learn/LearningCard";
import { Icon } from "@iconify/react";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Profil bilgisini çek (XP için)
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, full_name")
    .eq("id", user?.id)
    .single();

  // 2. Tüm öğrenme içeriklerini çek
  const { data: learnings } = await supabase
    .from("micro_learnings")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 3. Kullanıcının tamamladığı içerikleri çek
  const { data: progress } = await supabase
    .from("user_progress")
    .select("learning_id")
    .eq("user_id", user?.id);

  // Tamamlanan ID'leri bir Set yapısına al (Hızlı kontrol için)
  const completedIds = new Set(progress?.map((p) => p.learning_id));

  // Kullanıcının seviyesini hesapla (Basit mantık: Her 100 XP = 1 Seviye)
  const currentXP = profile?.total_xp || 0;
  const level = Math.floor(currentXP / 100) + 1;
  const nextLevelXP = level * 100;
  const progressPercent = ((currentXP % 100) / 100) * 100;

  return (
    <div className="space-y-8">
      {/* --- HEADER & GAMIFICATION CARD --- */}
      <div className="bg-gradient-to-r from-primary to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Dekoratif Arkaplan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Sol: Mesaj */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Mikro Öğrenme Merkezi</h1>
            <p className="text-blue-200 text-lg max-w-xl">
              Günde 5 dakika ayırarak yeni yetkinlikler kazan. Her tamamlanan
              kart seni bir üst seviyeye taşır.
            </p>
          </div>

          {/* Sağ: İstatistikler & Level */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 min-w-[280px]">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                  Seviye
                </span>
                <div className="text-4xl font-extrabold text-white leading-none">
                  {level}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400">
                  {currentXP} / {nextLevelXP} XP
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-blue-200 mt-2 text-center font-medium">
              Sonraki seviye için {nextLevelXP - currentXP} XP daha
              kazanmalısın.
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Sizin İçin Önerilenler
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learnings?.map((learning) => (
            <LearningCard
              key={learning.id}
              learning={learning}
              isCompleted={completedIds.has(learning.id)}
            />
          ))}

          {(!learnings || learnings.length === 0) && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Icon
                icon="heroicons:face-frown"
                className="text-4xl text-slate-300 mx-auto mb-2"
              />
              <p className="text-slate-500">
                Henüz yayınlanmış bir içerik bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
