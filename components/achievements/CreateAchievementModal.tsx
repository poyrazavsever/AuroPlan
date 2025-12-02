"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  createTeamAchievement,
  createProjectAchievement,
} from "@/app/(dashboard)/dashboard/achievements/actions";
import toast from "react-hot-toast";

// İkon seçenekleri
const ICON_OPTIONS = [
  { value: "heroicons:trophy", label: "Kupa" },
  { value: "heroicons:star", label: "Yıldız" },
  { value: "heroicons:fire", label: "Ateş" },
  { value: "heroicons:bolt", label: "Şimşek" },
  { value: "heroicons:rocket-launch", label: "Roket" },
  { value: "heroicons:academic-cap", label: "Mezuniyet" },
  { value: "heroicons:check-badge", label: "Rozet" },
  { value: "heroicons:heart", label: "Kalp" },
  { value: "heroicons:puzzle-piece", label: "Puzzle" },
  { value: "heroicons:light-bulb", label: "Ampul" },
  { value: "heroicons:chart-bar", label: "Grafik" },
  { value: "heroicons:users", label: "Takım" },
  { value: "heroicons:code-bracket", label: "Kod" },
  { value: "heroicons:document-check", label: "Belge" },
  { value: "heroicons:clock", label: "Saat" },
  { value: "heroicons:calendar-days", label: "Takvim" },
];

// Renk seçenekleri
const COLOR_OPTIONS = [
  { value: "amber", label: "Altın", class: "bg-amber-500" },
  { value: "blue", label: "Mavi", class: "bg-blue-500" },
  { value: "green", label: "Yeşil", class: "bg-green-500" },
  { value: "red", label: "Kırmızı", class: "bg-red-500" },
  { value: "purple", label: "Mor", class: "bg-purple-500" },
  { value: "pink", label: "Pembe", class: "bg-pink-500" },
  { value: "cyan", label: "Turkuaz", class: "bg-cyan-500" },
  { value: "orange", label: "Turuncu", class: "bg-orange-500" },
];

// Kategori seçenekleri
const CATEGORY_OPTIONS = [
  { value: "general", label: "Genel" },
  { value: "tasks", label: "Görevler" },
  { value: "projects", label: "Projeler" },
  { value: "learning", label: "Öğrenme" },
  { value: "collaboration", label: "İşbirliği" },
  { value: "streak", label: "Seri" },
];

// Tetikleyici tipleri
const TRIGGER_OPTIONS = [
  { value: "manual", label: "Manuel (Yönetici verir)" },
  { value: "task_complete", label: "Görev Tamamlama" },
  { value: "project_complete", label: "Proje Tamamlama" },
  { value: "count_based", label: "Sayıya Dayalı" },
];

interface CreateAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: "team" | "project";
  scopeId: string;
}

export default function CreateAchievementModal({
  isOpen,
  onClose,
  scope,
  scopeId,
}: CreateAchievementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("heroicons:trophy");
  const [selectedColor, setSelectedColor] = useState("amber");
  const [triggerType, setTriggerType] = useState("manual");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);
    formData.set("badgeColor", selectedColor);
    formData.set("triggerType", triggerType);

    if (scope === "team") {
      formData.set("teamId", scopeId);
    } else {
      formData.set("projectId", scopeId);
    }

    try {
      const result =
        scope === "team"
          ? await createTeamAchievement(formData)
          : await createProjectAchievement(formData);

      if (result.success) {
        toast.success("Başarım oluşturuldu!");
        onClose();
      } else {
        toast.error(result.error || "Başarım oluşturulamadı.");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Yeni Başarım Oluştur
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon icon="heroicons:x-mark" className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={100}
              placeholder="Örn: İlk Proje Tamamlama"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Açıklama
            </label>
            <textarea
              name="description"
              rows={2}
              maxLength={500}
              placeholder="Başarımın açıklaması..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* İkon Seçimi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              İkon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setSelectedIcon(icon.value)}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    selectedIcon === icon.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  title={icon.label}
                >
                  <Icon icon={icon.value} className="text-xl text-slate-700" />
                </button>
              ))}
            </div>
          </div>

          {/* Renk Seçimi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rozet Rengi
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-9 h-9 rounded-full ${
                    color.class
                  } transition-all ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* XP Ödülü */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              XP Ödülü
            </label>
            <div className="relative">
              <input
                type="number"
                name="xpReward"
                min={10}
                max={1000}
                defaultValue={50}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-amber-500">
                <Icon icon="heroicons:bolt" />
                <span className="text-sm font-medium">XP</span>
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Kategori
            </label>
            <select
              name="category"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tetikleyici Tipi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Kazanma Şekli
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {TRIGGER_OPTIONS.map((trigger) => (
                <option key={trigger.value} value={trigger.value}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tetikleyici Değeri (count_based için) */}
          {triggerType === "count_based" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hedef Sayı
              </label>
              <input
                type="number"
                name="triggerValue"
                min={1}
                max={1000}
                defaultValue={5}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">
                Kullanıcının başarımı kazanmak için ulaşması gereken sayı
              </p>
            </div>
          )}

          {/* Önizleme */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-2">Önizleme</p>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedColor === "amber"
                    ? "bg-amber-100"
                    : selectedColor === "blue"
                    ? "bg-blue-100"
                    : selectedColor === "green"
                    ? "bg-green-100"
                    : selectedColor === "red"
                    ? "bg-red-100"
                    : selectedColor === "purple"
                    ? "bg-purple-100"
                    : selectedColor === "pink"
                    ? "bg-pink-100"
                    : selectedColor === "cyan"
                    ? "bg-cyan-100"
                    : "bg-orange-100"
                }`}
              >
                <Icon
                  icon={selectedIcon}
                  className={`text-2xl ${
                    selectedColor === "amber"
                      ? "text-amber-600"
                      : selectedColor === "blue"
                      ? "text-blue-600"
                      : selectedColor === "green"
                      ? "text-green-600"
                      : selectedColor === "red"
                      ? "text-red-600"
                      : selectedColor === "purple"
                      ? "text-purple-600"
                      : selectedColor === "pink"
                      ? "text-pink-600"
                      : selectedColor === "cyan"
                      ? "text-cyan-600"
                      : "text-orange-600"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-slate-900">Başlık Buraya</p>
                <p className="text-xs text-slate-500">
                  Açıklama buraya gelecek
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="text-lg animate-spin"
                  />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:plus" className="text-lg" />
                  Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
