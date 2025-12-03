"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import {
  updateSponsorStatus,
  deleteSponsor,
} from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
import toast from "react-hot-toast";
import SponsorDetailModal from "./SponsorDetailModal";
import type { SponsorPackage } from "@/types/supabase";

type SponsorWithPackage = {
  id: string;
  organization_id: string;
  company_name: string;
  company_logo_url: string | null;
  company_website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  package_id: string | null;
  custom_amount: number | null;
  currency: string;
  status: string;
  priority: string;
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

type SponsorTableProps = {
  sponsors: SponsorWithPackage[];
  packages: SponsorPackage[];
  organizationId: string;
  canManage: boolean;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  potential: { label: "Potansiyel", color: "bg-slate-100 text-slate-700" },
  contacted: { label: "İletişimde", color: "bg-blue-100 text-blue-700" },
  negotiating: { label: "Görüşmede", color: "bg-amber-100 text-amber-700" },
  proposal_sent: { label: "Teklif", color: "bg-purple-100 text-purple-700" },
  approved: { label: "Onaylı", color: "bg-green-100 text-green-700" },
  rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
  cancelled: { label: "İptal", color: "bg-gray-100 text-gray-700" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "Yüksek", color: "text-red-600" },
  medium: { label: "Orta", color: "text-amber-600" },
  low: { label: "Düşük", color: "text-slate-400" },
};

export default function SponsorTable({
  sponsors,
  packages,
  organizationId,
  canManage,
}: SponsorTableProps) {
  const [selectedSponsor, setSelectedSponsor] =
    useState<SponsorWithPackage | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  const handleStatusChange = async (sponsorId: string, status: string) => {
    setLoadingId(sponsorId);
    try {
      await updateSponsorStatus(sponsorId, status, organizationId);
      toast.success("Durum güncellendi");
    } catch (error) {
      toast.error("Güncellenemedi");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (sponsorId: string, companyName: string) => {
    if (
      !confirm(`${companyName} sponsorunu silmek istediğinizden emin misiniz?`)
    )
      return;

    setLoadingId(sponsorId);
    try {
      await deleteSponsor(sponsorId, organizationId);
      toast.success("Sponsor silindi");
    } catch (error) {
      toast.error("Silinemedi");
    } finally {
      setLoadingId(null);
    }
  };

  const getSponsorAmount = (sponsor: SponsorWithPackage) => {
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
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Şirket
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Takip
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sponsors.map((sponsor) => {
                const statusInfo =
                  statusConfig[sponsor.status] || statusConfig.potential;
                const priorityInfo =
                  priorityConfig[sponsor.priority] || priorityConfig.medium;

                return (
                  <tr
                    key={sponsor.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Şirket */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {sponsor.company_logo_url ? (
                            <Image
                              src={sponsor.company_logo_url}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon
                              icon="heroicons:building-office"
                              className="text-slate-400"
                            />
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedSponsor(sponsor)}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {sponsor.company_name}
                          </button>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Icon
                              icon="heroicons:flag"
                              className={`text-xs ${priorityInfo.color}`}
                            />
                            <span className={`text-xs ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* İletişim */}
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-slate-900">
                          {sponsor.contact_name || "-"}
                        </p>
                        {sponsor.contact_email && (
                          <p className="text-slate-500 text-xs truncate max-w-[150px]">
                            {sponsor.contact_email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Paket */}
                    <td className="px-4 py-3">
                      {sponsor.sponsor_packages ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${
                              sponsor.sponsor_packages.color || "#3B82F6"
                            }20`,
                            color: sponsor.sponsor_packages.color || "#3B82F6",
                          }}
                        >
                          {sponsor.sponsor_packages.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Özel</span>
                      )}
                    </td>

                    {/* Tutar */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {getSponsorAmount(sponsor)}
                      </span>
                    </td>

                    {/* Durum */}
                    <td className="px-4 py-3">
                      {canManage ? (
                        <select
                          value={sponsor.status}
                          onChange={(e) =>
                            handleStatusChange(sponsor.id, e.target.value)
                          }
                          disabled={loadingId === sponsor.id}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusInfo.color}`}
                        >
                          {Object.entries(statusConfig).map(
                            ([value, config]) => (
                              <option key={value} value={value}>
                                {config.label}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      )}
                    </td>

                    {/* Takip */}
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {sponsor.next_followup_date ? (
                          <div className="flex items-center gap-1.5">
                            <Icon
                              icon="heroicons:calendar"
                              className="text-slate-400"
                            />
                            <span className="text-slate-600">
                              {formatDate(sponsor.next_followup_date)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSponsor(sponsor)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                          title="Detaylar"
                        >
                          <Icon icon="heroicons:eye" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() =>
                              handleDelete(sponsor.id, sponsor.company_name)
                            }
                            disabled={loadingId === sponsor.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                            title="Sil"
                          >
                            <Icon icon="heroicons:trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSponsor && (
        <SponsorDetailModal
          sponsor={selectedSponsor}
          packages={packages}
          organizationId={organizationId}
          canManage={canManage}
          onClose={() => setSelectedSponsor(null)}
        />
      )}
    </>
  );
}
