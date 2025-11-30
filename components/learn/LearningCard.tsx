"use client";

import { Icon } from "@iconify/react";
import { completeLearning } from "../../app/(dashboard)/dashboard/learn/actions";
import { useState } from "react";
import toast from "react-hot-toast";

type Learning = {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  xp: number;
};

// Kategoriye göre renk/ikon haritası
const categoryConfig: Record<string, { color: string; icon: string }> = {
  Productivity: {
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: "heroicons:clock",
  },
  Communication: {
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: "heroicons:chat-bubble-left-right",
  },
  Management: {
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: "heroicons:briefcase",
  },
  Strategy: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: "heroicons:map",
  },
  "Soft Skills": {
    color: "text-pink-600 bg-pink-50 border-pink-200",
    icon: "heroicons:heart",
  },
  default: {
    color: "text-slate-600 bg-slate-50 border-slate-200",
    icon: "heroicons:light-bulb",
  },
};

export default function LearningCard({
  learning,
  isCompleted,
}: {
  learning: Learning;
  isCompleted: boolean;
}) {
  const [loading, setLoading] = useState(false);

  // Kategoriyi güvenli şekilde al
  const config =
    categoryConfig[learning.category || "default"] || categoryConfig["default"];

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeLearning(learning.id, learning.xp);
      toast.success(`Harika! +${learning.xp} XP kazandın! 🎉`);
    } catch (error) {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
      ${
        isCompleted
          ? "border-green-200 shadow-sm opacity-75 grayscale-[0.3]"
          : "border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
      }
    `}
    >
      {/* Üst Bar (Kategori & Puan) */}
      <div className="p-5 pb-0 flex justify-between items-start">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${config.color}`}
        >
          <Icon icon={config.icon} />
          {learning.category}
        </div>
        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
          <Icon icon="heroicons:bolt" />
          {learning.xp} XP
        </div>
      </div>

      {/* İçerik */}
      <div className="p-5 flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
          {learning.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
          {learning.content}
        </p>
      </div>

      {/* Alt Aksiyon Alanı */}
      <div className="p-5 pt-0 mt-auto">
        {isCompleted ? (
          <div className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-100">
            <Icon icon="heroicons:check-badge" className="text-xl" />
            Tamamlandı
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Icon icon="svg-spinners:180-ring" />
            ) : (
              <>
                <Icon icon="heroicons:book-open" />
                Öğren & Tamamla
              </>
            )}
          </button>
        )}
      </div>

      {/* Dekoratif Tamamlandı İkonu (Arkaplan) */}
      {isCompleted && (
        <div className="absolute -right-4 -bottom-4 text-green-500/10 rotate-[-15deg] pointer-events-none">
          <Icon icon="heroicons:check-badge" className="text-9xl" />
        </div>
      )}
    </div>
  );
}
