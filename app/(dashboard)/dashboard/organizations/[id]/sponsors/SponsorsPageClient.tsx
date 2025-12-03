"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import SponsorTable from "@/components/organizations/sponsors/SponsorTable";
import SponsorKanban from "@/components/organizations/sponsors/SponsorKanban";
import AddSponsorModal from "@/components/organizations/sponsors/AddSponsorModal";
import SponsorPackagesModal from "@/components/organizations/sponsors/SponsorPackagesModal";
import SponsorStats from "@/components/organizations/sponsors/SponsorStats";
import type { SponsorPackage } from "@/types/supabase";

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

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

type Stats = {
  total: number;
  potential: number;
  contacted: number;
  negotiating: number;
  proposalSent: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  approvedAmount: number;
};

type SponsorsPageClientProps = {
  organizationId: string;
  organizationName: string;
  sponsors: SponsorWithPackage[];
  packages: SponsorPackage[];
  stats: Stats;
  teamMembers: TeamMember[];
  canManage: boolean;
};

const statusConfig = {
  potential: { label: "Potansiyel", color: "bg-slate-100 text-slate-700" },
  contacted: { label: "İletişimde", color: "bg-blue-100 text-blue-700" },
  negotiating: { label: "Görüşmede", color: "bg-amber-100 text-amber-700" },
  proposal_sent: { label: "Teklif", color: "bg-purple-100 text-purple-700" },
  approved: { label: "Onaylı", color: "bg-green-100 text-green-700" },
  rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
  cancelled: { label: "İptal", color: "bg-gray-100 text-gray-700" },
};

export default function SponsorsPageClient({
  organizationId,
  organizationName,
  sponsors,
  packages,
  stats,
  teamMembers,
  canManage,
}: SponsorsPageClientProps) {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtreleme
  const filteredSponsors = sponsors.filter((sponsor) => {
    const matchesStatus =
      filterStatus === "all" || sponsor.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || sponsor.priority === filterPriority;
    const matchesSearch =
      searchQuery === "" ||
      sponsor.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sponsor Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">{organizationName}</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPackagesModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              <Icon icon="heroicons:rectangle-stack" />
              Paketler
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
            >
              <Icon icon="heroicons:plus" />
              Sponsor Ekle
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <SponsorStats stats={stats} />

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Sponsor ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon icon="heroicons:table-cells" />
              Tablo
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon icon="heroicons:view-columns" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredSponsors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Icon
            icon="heroicons:building-office"
            className="text-5xl text-slate-300 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery || filterStatus !== "all" || filterPriority !== "all"
              ? "Sponsor bulunamadı"
              : "Henüz sponsor eklenmemiş"}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery || filterStatus !== "all" || filterPriority !== "all"
              ? "Filtrelerinizi değiştirmeyi deneyin"
              : "İlk sponsorunuzu ekleyerek başlayın"}
          </p>
          {canManage && !searchQuery && filterStatus === "all" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              <Icon icon="heroicons:plus" />
              Sponsor Ekle
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <SponsorTable
          sponsors={filteredSponsors}
          packages={packages}
          organizationId={organizationId}
          canManage={canManage}
        />
      ) : (
        <SponsorKanban
          sponsors={filteredSponsors}
          packages={packages}
          organizationId={organizationId}
          canManage={canManage}
        />
      )}

      {/* Modals */}
      {canManage && (
        <>
          <AddSponsorModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            organizationId={organizationId}
            packages={packages}
            teamMembers={teamMembers}
          />

          <SponsorPackagesModal
            isOpen={isPackagesModalOpen}
            onClose={() => setIsPackagesModalOpen(false)}
            organizationId={organizationId}
            packages={packages}
          />
        </>
      )}
    </div>
  );
}
