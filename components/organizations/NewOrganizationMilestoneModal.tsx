"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createMilestone } from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";

type NewOrganizationMilestoneModalProps = {
  organizationId: string;
};

const colorOptions = [
  { value: "#3B82F6", label: "Mavi" },
  { value: "#8B5CF6", label: "Mor" },
  { value: "#22C55E", label: "Yeşil" },
  { value: "#F97316", label: "Turuncu" },
  { value: "#EF4444", label: "Kırmızı" },
  { value: "#06B6D4", label: "Cyan" },
];

const iconOptions = [
  { value: "heroicons:flag", label: "Bayrak" },
  { value: "heroicons:star", label: "Yıldız" },
  { value: "heroicons:rocket-launch", label: "Roket" },
  { value: "heroicons:check-badge", label: "Rozet" },
  { value: "heroicons:trophy", label: "Kupa" },
  { value: "heroicons:light-bulb", label: "Ampul" },
  { value: "heroicons:megaphone", label: "Megafon" },
  { value: "heroicons:calendar", label: "Takvim" },
];

export default function NewOrganizationMilestoneModal({
  organizationId,
}: NewOrganizationMilestoneModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    color: "#3B82F6",
    icon: "heroicons:flag",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Başlık gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("organization_id", organizationId);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("due_date", formData.due_date);
      form.append("color", formData.color);
      form.append("icon", formData.icon);

      await createMilestone(form);
      toast.success("Kilometre taşı eklendi");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        due_date: "",
        color: "#3B82F6",
        icon: "heroicons:flag",
      });
    } catch (error) {
      toast.error("Eklenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Icon icon="heroicons:plus" />
        Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                Yeni Kilometre Taşı
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="text-xl text-slate-500"
                />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="örn: Sponsor Anlaşmaları"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detaylı açıklama..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hedef Tarih
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    İkon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: icon.value })
                        }
                        className={`p-2.5 rounded-lg border-2 transition-all ${
                          formData.icon === icon.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        title={icon.label}
                      >
                        <Icon
                          icon={icon.value}
                          className={`text-xl ${
                            formData.icon === icon.value
                              ? "text-blue-600"
                              : "text-slate-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Renk
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Icon
                      icon="heroicons:arrow-path"
                      className="animate-spin"
                    />
                  )}
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
