"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createSponsorPackage } from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
import toast from "react-hot-toast";

type CreatePackageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
};

const tierOptions = [
  { value: "platinum", label: "Platin", color: "bg-slate-100 text-slate-700" },
  { value: "gold", label: "Altın", color: "bg-amber-100 text-amber-700" },
  { value: "silver", label: "Gümüş", color: "bg-slate-100 text-slate-600" },
  { value: "bronze", label: "Bronz", color: "bg-orange-100 text-orange-700" },
  {
    value: "in_kind",
    label: "Ayni Sponsor",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "media",
    label: "Medya Sponsor",
    color: "bg-pink-100 text-pink-700",
  },
];

const defaultBenefits = [
  "Logo gösterimi",
  "Stand alanı",
  "Sosyal medya paylaşımı",
  "Web sitesinde tanıtım",
  "Katılımcı listesi",
  "Konuşmacı hakkı",
  "Ürün tanıtımı",
  "Banner alanı",
  "E-posta bülteni",
  "Basın bülteni dahil",
];

export default function CreatePackageModal({
  isOpen,
  onClose,
  organizationId,
}: CreatePackageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tier: "gold",
    amount: "",
    currency: "TRY",
    description: "",
  });
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [customBenefit, setCustomBenefit] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  };

  const addCustomBenefit = () => {
    if (
      customBenefit.trim() &&
      !selectedBenefits.includes(customBenefit.trim())
    ) {
      setSelectedBenefits([...selectedBenefits, customBenefit.trim()]);
      setCustomBenefit("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error("Paket adı ve tutar zorunludur");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("organization_id", organizationId);
      form.append("name", formData.name);
      form.append("tier", formData.tier);
      form.append("amount", formData.amount);
      form.append("currency", formData.currency);
      form.append("description", formData.description);
      form.append("benefits", JSON.stringify(selectedBenefits));

      await createSponsorPackage(form);
      toast.success("Sponsorluk paketi oluşturuldu");
      handleClose();
    } catch (error) {
      toast.error("Paket oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      tier: "gold",
      amount: "",
      currency: "TRY",
      description: "",
    });
    setSelectedBenefits([]);
    setCustomBenefit("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Sponsorluk Paketi Oluştur
            </h2>
            <p className="text-sm text-slate-500">
              Standart paket şablonu tanımlayın
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Icon icon="heroicons:x-mark" className="text-xl text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paket Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Örn: Altın Sponsor Paketi"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            {/* Tier Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seviye
              </label>
              <div className="grid grid-cols-3 gap-2">
                {tierOptions.map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tier: tier.value })
                    }
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      formData.tier === tier.value
                        ? `${tier.color} border-current`
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tutar *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Örn: 50000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Para Birimi
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paket Avantajları
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {defaultBenefits.map((benefit) => (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => toggleBenefit(benefit)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedBenefits.includes(benefit)
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {selectedBenefits.includes(benefit) && (
                      <Icon icon="heroicons:check" className="inline mr-1" />
                    )}
                    {benefit}
                  </button>
                ))}
              </div>

              {/* Custom benefit input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBenefit}
                  onChange={(e) => setCustomBenefit(e.target.value)}
                  placeholder="Özel avantaj ekle..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomBenefit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomBenefit}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"
                >
                  <Icon icon="heroicons:plus" />
                </button>
              </div>

              {/* Selected benefits preview */}
              {selectedBenefits.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                  <div className="text-xs font-medium text-blue-600 mb-2">
                    Seçili Avantajlar ({selectedBenefits.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedBenefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs text-blue-700"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => toggleBenefit(benefit)}
                          className="hover:text-red-500"
                        >
                          <Icon icon="heroicons:x-mark" className="text-sm" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Bu paket hakkında detaylı açıklama..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={handleClose}
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
              Paket Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
