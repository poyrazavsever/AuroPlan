"use client";

import type { TaskCategory } from "@/types/supabase";

interface Props {
  selectedCategory: TaskCategory | "all";
  onChange: (category: TaskCategory | "all") => void;
  stats: Record<string, number>;
}

// Kategori bilgileri
export const TASK_CATEGORIES: Record<
  TaskCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  logistics: {
    label: "Lojistik",
    icon: "📦",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  communication: {
    label: "İletişim",
    icon: "📣",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  technical: {
    label: "Teknik",
    icon: "💻",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  content: {
    label: "İçerik",
    icon: "📝",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  finance: {
    label: "Finans",
    icon: "💰",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  marketing: {
    label: "Pazarlama",
    icon: "🎨",
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  other: {
    label: "Diğer",
    icon: "📋",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-700",
  },
};

export default function TaskCategoryFilter({
  selectedCategory,
  onChange,
  stats,
}: Props) {
  return (
    <div className="relative group">
      <select
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value as TaskCategory | "all")}
        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm appearance-none pr-8 cursor-pointer"
      >
        <option value="all">Tüm Kategoriler</option>
        {Object.entries(TASK_CATEGORIES).map(([key, { label, icon }]) => (
          <option key={key} value={key}>
            {icon} {label} {stats[key] ? `(${stats[key]})` : ""}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

// Kategori Badge bileşeni (diğer yerlerde kullanmak için)
export function CategoryBadge({
  category,
  size = "sm",
}: {
  category: TaskCategory | null;
  size?: "sm" | "md";
}) {
  const cat = category || "other";
  const { label, icon, color, bgColor } = TASK_CATEGORIES[cat];

  return (
    <span
      className={`inline-flex items-center gap-1 ${bgColor} ${color} rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
