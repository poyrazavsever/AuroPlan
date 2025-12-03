"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { updateSponsorStatus } from "@/app/(dashboard)/dashboard/organizations/[id]/sponsors/actions";
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

type SponsorKanbanProps = {
  sponsors: SponsorWithPackage[];
  packages: SponsorPackage[];
  organizationId: string;
  canManage: boolean;
};

const columns = [
  { id: "potential", label: "Potansiyel", color: "bg-slate-500" },
  { id: "contacted", label: "İletişimde", color: "bg-blue-500" },
  { id: "negotiating", label: "Görüşmede", color: "bg-amber-500" },
  { id: "proposal_sent", label: "Teklif", color: "bg-purple-500" },
  { id: "approved", label: "Onaylı", color: "bg-green-500" },
  { id: "rejected", label: "Reddedildi", color: "bg-red-500" },
];

const priorityConfig: Record<string, { icon: string; color: string }> = {
  high: { icon: "heroicons:chevron-double-up", color: "text-red-500" },
  medium: { icon: "heroicons:minus", color: "text-amber-500" },
  low: { icon: "heroicons:chevron-double-down", color: "text-slate-400" },
};

export default function SponsorKanban({
  sponsors,
  packages,
  organizationId,
  canManage,
}: SponsorKanbanProps) {
  const [selectedSponsor, setSelectedSponsor] =
    useState<SponsorWithPackage | null>(null);
  const [draggedSponsor, setDraggedSponsor] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    return null;
  };

  const handleDragStart = (e: React.DragEvent, sponsorId: string) => {
    if (!canManage) return;
    setDraggedSponsor(sponsorId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedSponsor || !canManage) return;

    const sponsor = sponsors.find((s) => s.id === draggedSponsor);
    if (sponsor && sponsor.status !== newStatus) {
      try {
        await updateSponsorStatus(draggedSponsor, newStatus, organizationId);
        toast.success("Durum güncellendi");
      } catch (error) {
        toast.error("Güncellenemedi");
      }
    }
    setDraggedSponsor(null);
  };

  const getColumnSponsors = (status: string) => {
    return sponsors.filter((s) => s.status === status);
  };

  const getColumnTotal = (status: string) => {
    return getColumnSponsors(status).reduce((sum, sponsor) => {
      if (sponsor.custom_amount) return sum + sponsor.custom_amount;
      if (sponsor.sponsor_packages)
        return sum + sponsor.sponsor_packages.amount;
      return sum;
    }, 0);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnSponsors = getColumnSponsors(column.id);
          const columnTotal = getColumnTotal(column.id);

          return (
            <div
              key={column.id}
              className="shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-slate-900">
                    {column.label}
                  </h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {columnSponsors.length}
                  </span>
                </div>
              </div>

              {/* Column Total */}
              {columnTotal > 0 && (
                <div className="text-sm text-slate-500 mb-3">
                  {formatCurrency(columnTotal)}
                </div>
              )}

              {/* Cards */}
              <div className="space-y-3 min-h-[200px] bg-slate-50 rounded-xl p-3">
                {columnSponsors.map((sponsor) => {
                  const priorityInfo =
                    priorityConfig[sponsor.priority] || priorityConfig.medium;
                  const amount = getSponsorAmount(sponsor);

                  return (
                    <div
                      key={sponsor.id}
                      draggable={canManage}
                      onDragStart={(e) => handleDragStart(e, sponsor.id)}
                      onClick={() => setSelectedSponsor(sponsor)}
                      className={`bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all ${
                        draggedSponsor === sponsor.id ? "opacity-50" : ""
                      } ${
                        canManage ? "cursor-grab active:cursor-grabbing" : ""
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                            {sponsor.company_logo_url ? (
                              <Image
                                src={sponsor.company_logo_url}
                                alt=""
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon
                                icon="heroicons:building-office"
                                className="text-slate-400 text-sm"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 text-sm line-clamp-1">
                              {sponsor.company_name}
                            </h4>
                          </div>
                        </div>
                        <Icon
                          icon={priorityInfo.icon}
                          className={`${priorityInfo.color} text-sm`}
                        />
                      </div>

                      {/* Contact */}
                      {sponsor.contact_name && (
                        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                          <Icon
                            icon="heroicons:user"
                            className="text-slate-400"
                          />
                          {sponsor.contact_name}
                        </p>
                      )}

                      {/* Package & Amount */}
                      <div className="flex items-center justify-between">
                        {sponsor.sponsor_packages ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${
                                sponsor.sponsor_packages.color || "#3B82F6"
                              }20`,
                              color:
                                sponsor.sponsor_packages.color || "#3B82F6",
                            }}
                          >
                            {sponsor.sponsor_packages.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Özel</span>
                        )}

                        {amount && (
                          <span className="text-sm font-semibold text-slate-900">
                            {amount}
                          </span>
                        )}
                      </div>

                      {/* Next Followup */}
                      {sponsor.next_followup_date && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                          <Icon icon="heroicons:calendar" />
                          {new Date(
                            sponsor.next_followup_date
                          ).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {columnSponsors.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
                    Sponsor yok
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
