"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createSponsor } from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
import toast from "react-hot-toast";
import type { SponsorPackage } from "@/types/supabase";

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

type AddSponsorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  packages: SponsorPackage[];
  teamMembers: TeamMember[];
};

const industries = [
  "Teknoloji",
  "Finans",
  "E-ticaret",
  "Sağlık",
  "Eğitim",
  "Medya",
  "Otomotiv",
  "Gıda",
  "Enerji",
  "Telekomünikasyon",
  "Diğer",
];

const companySizes = [
  { value: "startup", label: "Startup (1-10)" },
  { value: "small", label: "Küçük (11-50)" },
  { value: "medium", label: "Orta (51-200)" },
  { value: "enterprise", label: "Kurumsal (200+)" },
];

export default function AddSponsorModal({
  isOpen,
  onClose,
  organizationId,
  packages,
  teamMembers,
}: AddSponsorModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_website: "",
    company_description: "",
    industry: "",
    company_size: "",
    contact_name: "",
    contact_title: "",
    contact_email: "",
    contact_phone: "",
    contact_linkedin: "",
    package_id: "",
    custom_amount: "",
    status: "potential",
    priority: "medium",
    notes: "",
    next_followup_date: "",
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
    if (!formData.company_name) {
      toast.error("Şirket adı zorunludur");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("organization_id", organizationId);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      await createSponsor(form);
      toast.success("Sponsor eklendi");
      handleClose();
    } catch (error) {
      toast.error("Sponsor eklenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      company_name: "",
      company_website: "",
      company_description: "",
      industry: "",
      company_size: "",
      contact_name: "",
      contact_title: "",
      contact_email: "",
      contact_phone: "",
      contact_linkedin: "",
      package_id: "",
      custom_amount: "",
      status: "potential",
      priority: "medium",
      notes: "",
      next_followup_date: "",
    });
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sponsor Ekle</h2>
            <p className="text-sm text-slate-500">Adım {step} / 3</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Icon icon="heroicons:x-mark" className="text-xl text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Şirket Bilgileri */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Icon
                    icon="heroicons:building-office"
                    className="text-blue-500"
                  />
                  Şirket Bilgileri
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Örn: ABC Teknoloji A.Ş."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Web Sitesi
                  </label>
                  <input
                    type="url"
                    name="company_website"
                    value={formData.company_website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sektör
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seçin...</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Şirket Büyüklüğü
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seçin...</option>
                      {companySizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    name="company_description"
                    value={formData.company_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Şirket hakkında kısa bilgi..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: İletişim Bilgileri */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Icon icon="heroicons:user" className="text-green-500" />
                  İletişim Kişisi
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pozisyon
                    </label>
                    <input
                      type="text"
                      name="contact_title"
                      value={formData.contact_title}
                      onChange={handleChange}
                      placeholder="Örn: Pazarlama Müdürü"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="ornek@sirket.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="contact_linkedin"
                      value={formData.contact_linkedin}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Sponsorluk Detayları */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Icon icon="heroicons:banknotes" className="text-amber-500" />
                  Sponsorluk Detayları
                </h3>

                {packages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sponsorluk Paketi
                    </label>
                    <select
                      name="package_id"
                      value={formData.package_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="">Özel Tutar</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} -{" "}
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: pkg.currency,
                            minimumFractionDigits: 0,
                          }).format(pkg.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!formData.package_id && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Özel Tutar (TL)
                    </label>
                    <input
                      type="number"
                      name="custom_amount"
                      value={formData.custom_amount}
                      onChange={handleChange}
                      placeholder="Örn: 50000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Durum
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="potential">Potansiyel</option>
                      <option value="contacted">İletişime Geçildi</option>
                      <option value="negotiating">Görüşme Aşamasında</option>
                      <option value="proposal_sent">Teklif Gönderildi</option>
                      <option value="approved">Onaylandı</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Öncelik
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="high">Yüksek</option>
                      <option value="medium">Orta</option>
                      <option value="low">Düşük</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sonraki Takip Tarihi
                  </label>
                  <input
                    type="date"
                    name="next_followup_date"
                    value={formData.next_followup_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Sponsor hakkında notlar..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              {step > 1 ? "Geri" : "İptal"}
            </button>

            <div className="flex items-center gap-2">
              {/* Step indicators */}
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step
                      ? "bg-blue-600"
                      : s < step
                      ? "bg-blue-300"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
              >
                Devam
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <Icon icon="heroicons:arrow-path" className="animate-spin" />
                )}
                Sponsor Ekle
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
