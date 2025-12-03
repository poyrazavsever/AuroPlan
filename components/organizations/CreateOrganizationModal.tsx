"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { createOrganization } from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";

type Team = {
  id: string;
  name: string;
  slug: string;
};

type CreateOrganizationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
};

const organizationTypes = [
  {
    value: "hackathon",
    label: "Hackathon",
    icon: "heroicons:code-bracket-square",
    description: "Yazılım/tasarım maratonları",
  },
  {
    value: "conference",
    label: "Konferans",
    icon: "heroicons:microphone",
    description: "Büyük ölçekli etkinlikler",
  },
  {
    value: "workshop",
    label: "Workshop",
    icon: "heroicons:academic-cap",
    description: "Uygulamalı eğitimler",
  },
  {
    value: "meetup",
    label: "Meetup",
    icon: "heroicons:user-group",
    description: "Topluluk buluşmaları",
  },
  {
    value: "social",
    label: "Sosyal Etkinlik",
    icon: "heroicons:cake",
    description: "Networking, kutlama",
  },
  {
    value: "webinar",
    label: "Webinar",
    icon: "heroicons:video-camera",
    description: "Online seminerler",
  },
  {
    value: "sprint",
    label: "Sprint / Jam",
    icon: "heroicons:bolt",
    description: "Yoğun çalışma dönemleri",
  },
  {
    value: "other",
    label: "Diğer",
    icon: "heroicons:squares-2x2",
    description: "Diğer etkinlikler",
  },
];

const locationTypes = [
  { value: "physical", label: "Fiziksel", icon: "heroicons:map-pin" },
  { value: "online", label: "Online", icon: "heroicons:globe-alt" },
  { value: "hybrid", label: "Hibrit", icon: "heroicons:arrows-right-left" },
];

const colorOptions = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#64748B", // Slate
];

export default function CreateOrganizationModal({
  isOpen,
  onClose,
  teams,
}: CreateOrganizationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    scope: "team",
    team_id: teams[0]?.id || "",
    start_date: "",
    end_date: "",
    location_type: "physical",
    location_name: "",
    location_address: "",
    location_url: "",
    visibility: "private",
    color_theme: "#3B82F6",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, color_theme: color });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const result = await createOrganization(form);
      toast.success("Organizasyon oluşturuldu!");
      resetForm();
      onClose();
      router.push(`/dashboard/organizations/${result.organizationId}`);
    } catch (error) {
      toast.error("Organizasyon oluşturulamadı");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      scope: "team",
      team_id: teams[0]?.id || "",
      start_date: "",
      end_date: "",
      location_type: "physical",
      location_name: "",
      location_address: "",
      location_url: "",
      visibility: "private",
      color_theme: "#3B82F6",
    });
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Yeni Organizasyon
            </h2>
            <p className="text-sm text-slate-500">Adım {step} / 3</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon icon="heroicons:x-mark" className="text-xl text-slate-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Organizasyon Türü *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {organizationTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeSelect(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.type === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          icon={type.icon}
                          className={`text-2xl mb-2 ${
                            formData.type === type.value
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        />
                        <p className="font-medium text-slate-900 text-sm">
                          {type.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Organizasyon Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="örn: Tech Summit 2025"
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
                    placeholder="Organizasyonunuz hakkında kısa bir açıklama..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Takım
                    </label>
                    <select
                      name="team_id"
                      value={formData.team_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="">Kişisel</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                        onClick={() => handleColorSelect(color)}
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
            )}

            {/* Step 3: Date & Location */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Başlangıç Tarihi
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
                      Bitiş Tarihi
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
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Konum Türü
                  </label>
                  <div className="flex gap-3">
                    {locationTypes.map((loc) => (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, location_type: loc.value })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          formData.location_type === loc.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon icon={loc.icon} className="text-lg" />
                        <span className="font-medium">{loc.label}</span>
                      </button>
                    ))}
                  </div>
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
                        placeholder="örn: İstanbul Kongre Merkezi"
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
                        placeholder="Tam adres..."
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
                      placeholder="https://zoom.us/... veya https://meet.google.com/..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              {step > 1 ? "Geri" : "İptal"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.type) {
                    toast.error("Lütfen bir tür seçin");
                    return;
                  }
                  if (step === 2 && !formData.name) {
                    toast.error("Lütfen organizasyon adını girin");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
              >
                Devam
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <Icon icon="heroicons:arrow-path" className="animate-spin" />
                )}
                Oluştur
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
