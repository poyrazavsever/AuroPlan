"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { deleteSponsorPackage } from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
import CreatePackageModal from "./CreatePackageModal";
import toast from "react-hot-toast";
import type { Json } from "@/types/supabase";

// Extended package type with tier and description
type PackageWithTier = {
  id: string;
  organization_id: string;
  name: string;
  tier?: string;
  description?: string | null;
  amount: number;
  currency: string;
  benefits: Json;
  max_sponsors: number | null;
  current_sponsors: number;
  color: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
};

type SponsorPackagesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  packages: PackageWithTier[];
};

const tierLabels: Record<string, string> = {
  platinum: "Platin",
  gold: "Altın",
  silver: "Gümüş",
  bronze: "Bronz",
  in_kind: "Ayni",
  media: "Medya",
  other: "Diğer",
};

const tierColors: Record<string, string> = {
  platinum: "bg-slate-100 text-slate-700 border-slate-300",
  gold: "bg-amber-50 text-amber-700 border-amber-300",
  silver: "bg-slate-50 text-slate-600 border-slate-300",
  bronze: "bg-orange-50 text-orange-700 border-orange-300",
  in_kind: "bg-purple-50 text-purple-700 border-purple-300",
  media: "bg-pink-50 text-pink-700 border-pink-300",
  other: "bg-slate-50 text-slate-600 border-slate-300",
};

export default function SponsorPackagesModal({
  isOpen,
  onClose,
  organizationId,
  packages,
}: SponsorPackagesModalProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (packageId: string) => {
    if (!confirm("Bu paketi silmek istediğinize emin misiniz?")) return;

    setIsDeleting(packageId);
    try {
      await deleteSponsorPackage(packageId, organizationId);
      toast.success("Paket silindi");
    } catch (error) {
      toast.error("Paket silinemedi");
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Sponsorluk Paketleri
              </h2>
              <p className="text-sm text-slate-500">
                Standart paket şablonlarını yönetin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
              >
                <Icon icon="heroicons:plus" />
                Yeni Paket
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="text-xl text-slate-500"
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="heroicons:rectangle-stack"
                  className="text-5xl text-slate-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Henüz paket oluşturulmamış
                </h3>
                <p className="text-slate-500 mb-6">
                  Sponsorluk paketleri oluşturarak sponsor takibini
                  kolaylaştırın
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                >
                  <Icon icon="heroicons:plus" />
                  İlk Paketi Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => {
                  const pkgTier = pkg.tier || "other";
                  return (
                    <div
                      key={pkg.id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                              tierColors[pkgTier] || tierColors.other
                            }`}
                          >
                            <Icon
                              icon="heroicons:trophy"
                              className="text-2xl"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {pkg.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                                  tierColors[pkgTier] || tierColors.other
                                }`}
                              >
                                {tierLabels[pkgTier] || pkgTier}
                              </span>
                            </div>
                            <div className="text-xl font-bold text-slate-900 mt-1">
                              {new Intl.NumberFormat("tr-TR", {
                                style: "currency",
                                currency: pkg.currency,
                                minimumFractionDigits: 0,
                              }).format(pkg.amount)}
                            </div>
                            {pkg.description && (
                              <p className="text-sm text-slate-500 mt-2">
                                {pkg.description}
                              </p>
                            )}
                            {pkg.benefits &&
                              Array.isArray(pkg.benefits) &&
                              pkg.benefits.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {(pkg.benefits as string[])
                                    .slice(0, 5)
                                    .map((benefit, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-white text-xs text-slate-600 rounded border border-slate-200"
                                      >
                                        {benefit}
                                      </span>
                                    ))}
                                  {(pkg.benefits as string[]).length > 5 && (
                                    <span className="px-2 py-0.5 text-xs text-slate-400">
                                      +{(pkg.benefits as string[]).length - 5}{" "}
                                      daha
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={isDeleting === pkg.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {isDeleting === pkg.id ? (
                            <Icon
                              icon="heroicons:arrow-path"
                              className="animate-spin"
                            />
                          ) : (
                            <Icon icon="heroicons:trash" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Create Package Modal */}
      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={organizationId}
      />
    </>
  );
}
