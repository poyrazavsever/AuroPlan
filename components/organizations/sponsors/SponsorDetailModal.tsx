"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  updateSponsor,
  updateSponsorStatus,
} from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
import toast from "react-hot-toast";
import type { SponsorPackage } from "@/types/supabase";

type SponsorWithPackage = {
  id: string;
  organization_id: string;
  company_name: string;
  company_logo_url: string | null;
  company_website: string | null;
  company_description?: string | null;
  industry?: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  package_id: string | null;
  custom_amount: number | null;
  currency: string;
  status: string;
  priority: string;
  notes?: string | null;
  next_followup_date: string | null;
  created_at: string;
  sponsor_packages?: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    color: string | null;
  } | null;
  assigned_profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type SponsorDetailModalProps = {
  sponsor: SponsorWithPackage;
  packages: SponsorPackage[];
  organizationId: string;
  canManage: boolean;
  onClose: () => void;
};

const statusLabels: Record<string, string> = {
  potential: "Potansiyel",
  contacted: "İletişime Geçildi",
  negotiating: "Görüşme Aşamasında",
  proposal_sent: "Teklif Gönderildi",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal Edildi",
};

const statusColors: Record<string, string> = {
  potential: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  negotiating: "bg-amber-100 text-amber-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const priorityLabels: Record<string, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const priorityColors: Record<string, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-slate-400",
};

export default function SponsorDetailModal({
  sponsor,
  packages,
  organizationId,
  canManage,
  onClose,
}: SponsorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    company_name: sponsor.company_name,
    company_website: sponsor.company_website || "",
    company_description: sponsor.company_description || "",
    industry: sponsor.industry || "",
    custom_amount: sponsor.custom_amount?.toString() || "",
    notes: sponsor.notes || "",
  });

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateSponsorStatus(sponsor.id, newStatus, organizationId);
      toast.success("Durum güncellendi");
    } catch (error) {
      toast.error("Durum güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      const form = new FormData();
      form.append("organization_id", organizationId);
      Object.entries(editData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      await updateSponsor(sponsor.id, form);
      toast.success("Sponsor güncellendi");
      setIsEditing(false);
    } catch (error) {
      toast.error("Sponsor güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  };

  const getSponsorAmount = () => {
    if (sponsor.custom_amount) {
      return formatCurrency(sponsor.custom_amount, sponsor.currency);
    }
    if (sponsor.sponsor_packages) {
      return formatCurrency(
        sponsor.sponsor_packages.amount,
        sponsor.sponsor_packages.currency
      );
    }
    return "-";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {sponsor.company_logo_url ? (
                <img
                  src={sponsor.company_logo_url}
                  alt={sponsor.company_name}
                  className="w-14 h-14 rounded-xl object-contain bg-slate-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {sponsor.company_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {sponsor.company_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {sponsor.sponsor_packages && (
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${
                          sponsor.sponsor_packages.color || "#3B82F6"
                        }20`,
                        color: sponsor.sponsor_packages.color || "#3B82F6",
                      }}
                    >
                      {sponsor.sponsor_packages.name}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[sponsor.status]
                    }`}
                  >
                    {statusLabels[sponsor.status]}
                  </span>
                </div>
              </div>
            </div>
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

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              {
                id: "details",
                label: "Detaylar",
                icon: "heroicons:information-circle",
              },
              { id: "notes", label: "Notlar", icon: "heroicons:document-text" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon icon={tab.icon} className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Quick Actions */}
              {canManage && (
                <div className="flex items-center gap-3">
                  <select
                    value={sponsor.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className={`px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center gap-2"
                  >
                    <Icon icon="heroicons:pencil" />
                    {isEditing ? "İptal" : "Düzenle"}
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      value={editData.company_name}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          company_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Web Sitesi
                    </label>
                    <input
                      type="url"
                      value={editData.company_website}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          company_website: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Özel Tutar (TL)
                    </label>
                    <input
                      type="number"
                      value={editData.custom_amount}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          custom_amount: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {isUpdating ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-500 mb-1">
                        Sponsorluk Tutarı
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {getSponsorAmount()}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-500 mb-1">Öncelik</div>
                      <div
                        className={`text-xl font-bold flex items-center gap-2 ${
                          priorityColors[sponsor.priority]
                        }`}
                      >
                        <Icon icon="heroicons:flag" />
                        {priorityLabels[sponsor.priority]}
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-3">
                    {sponsor.company_website && (
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="heroicons:globe-alt"
                          className="text-slate-400"
                        />
                        <a
                          href={sponsor.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {sponsor.company_website}
                        </a>
                      </div>
                    )}
                    {sponsor.industry && (
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="heroicons:building-office"
                          className="text-slate-400"
                        />
                        <span className="text-slate-700">
                          {sponsor.industry}
                        </span>
                      </div>
                    )}
                    {sponsor.next_followup_date && (
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="heroicons:calendar"
                          className="text-slate-400"
                        />
                        <span className="text-slate-700">
                          Sonraki Takip:{" "}
                          {new Date(
                            sponsor.next_followup_date
                          ).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(sponsor.contact_name ||
                    sponsor.contact_email ||
                    sponsor.contact_phone) && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-3">
                        İletişim Bilgileri
                      </h4>
                      <div className="space-y-2">
                        {sponsor.contact_name && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Icon
                              icon="heroicons:user"
                              className="text-slate-400"
                            />
                            {sponsor.contact_name}
                          </div>
                        )}
                        {sponsor.contact_email && (
                          <a
                            href={`mailto:${sponsor.contact_email}`}
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Icon
                              icon="heroicons:envelope"
                              className="text-slate-400"
                            />
                            {sponsor.contact_email}
                          </a>
                        )}
                        {sponsor.contact_phone && (
                          <a
                            href={`tel:${sponsor.contact_phone}`}
                            className="flex items-center gap-2 text-slate-700"
                          >
                            <Icon
                              icon="heroicons:phone"
                              className="text-slate-400"
                            />
                            {sponsor.contact_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {sponsor.company_description && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">
                        Açıklama
                      </h4>
                      <p className="text-slate-700">
                        {sponsor.company_description}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Notlar</h3>

              {sponsor.notes ? (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {sponsor.notes}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Icon
                    icon="heroicons:document-text"
                    className="text-4xl mx-auto mb-2"
                  />
                  <p>Henüz not eklenmemiş</p>
                </div>
              )}

              <div className="text-sm text-slate-400 flex items-center gap-2">
                <Icon icon="heroicons:clock" />
                Oluşturulma:{" "}
                {new Date(sponsor.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
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
  );
}
