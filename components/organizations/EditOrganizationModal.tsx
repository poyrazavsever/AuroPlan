"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { updateOrganization } from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";
import type { OrganizationWithRelations } from "@/types/supabase";

type EditOrganizationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationWithRelations;
};

const colorOptions = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#6366F1",
  "#64748B",
];

export default function EditOrganizationModal({
  isOpen,
  onClose,
  organization,
}: EditOrganizationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
    start_date: organization.start_date
      ? organization.start_date.slice(0, 16)
      : "",
    end_date: organization.end_date ? organization.end_date.slice(0, 16) : "",
    location_type: organization.location_type,
    location_name: organization.location_name || "",
    location_address: organization.location_address || "",
    location_url: organization.location_url || "",
    visibility: organization.visibility,
    color_theme: organization.color_theme,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      await updateOrganization(organization.id, form);
      toast.success("Organizasyon güncellendi");
      onClose();
    } catch (error) {
      toast.error("Güncellenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Organizasyonu Düzenle
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Icon icon="heroicons:x-mark" className="text-xl text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organizasyon Adı
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Başlangıç
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bitiş
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konum Türü
              </label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="physical">Fiziksel</option>
                <option value="online">Online</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>

            {(formData.location_type === "physical" ||
              formData.location_type === "hybrid") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mekan Adı
                  </label>
                  <input
                    type="text"
                    name="location_name"
                    value={formData.location_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    name="location_address"
                    value={formData.location_address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {(formData.location_type === "online" ||
              formData.location_type === "hybrid") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Online Link
                </label>
                <input
                  type="url"
                  name="location_url"
                  value={formData.location_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Görünürlük
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="private">Özel</option>
                <option value="team">Takım</option>
                <option value="public">Herkese Açık</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tema Rengi
              </label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color_theme: color })
                    }
                    className={`w-8 h-8 rounded-lg transition-all ${
                      formData.color_theme === color
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
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
                <Icon icon="heroicons:arrow-path" className="animate-spin" />
              )}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
