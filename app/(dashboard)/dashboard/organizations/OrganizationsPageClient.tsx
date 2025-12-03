"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { User } from "@supabase/supabase-js";
import OrganizationCard from "@/components/organizations/OrganizationCard";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import type { OrganizationWithRelations } from "@/types/supabase";

type Team = {
  id: string;
  name: string;
  slug: string;
};

type OrganizationsPageClientProps = {
  organizations: OrganizationWithRelations[];
  teams: Team[];
  user: User;
};

// Organizasyon türü label ve ikonları
const organizationTypes = {
  hackathon: {
    label: "Hackathon",
    icon: "heroicons:code-bracket-square",
    color: "bg-purple-100 text-purple-700",
  },
  conference: {
    label: "Konferans",
    icon: "heroicons:microphone",
    color: "bg-blue-100 text-blue-700",
  },
  workshop: {
    label: "Workshop",
    icon: "heroicons:academic-cap",
    color: "bg-green-100 text-green-700",
  },
  meetup: {
    label: "Meetup",
    icon: "heroicons:user-group",
    color: "bg-amber-100 text-amber-700",
  },
  social: {
    label: "Sosyal",
    icon: "heroicons:cake",
    color: "bg-pink-100 text-pink-700",
  },
  webinar: {
    label: "Webinar",
    icon: "heroicons:video-camera",
    color: "bg-cyan-100 text-cyan-700",
  },
  sprint: {
    label: "Sprint",
    icon: "heroicons:bolt",
    color: "bg-orange-100 text-orange-700",
  },
  other: {
    label: "Diğer",
    icon: "heroicons:squares-2x2",
    color: "bg-slate-100 text-slate-700",
  },
};

// Durum label ve renkleri
const statusConfig = {
  draft: { label: "Taslak", color: "bg-slate-100 text-slate-600" },
  planning: { label: "Planlama", color: "bg-blue-100 text-blue-700" },
  active: { label: "Aktif", color: "bg-green-100 text-green-700" },
  completed: { label: "Tamamlandı", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-700" },
};

export default function OrganizationsPageClient({
  organizations,
  teams,
  user,
}: OrganizationsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtreleme
  const filteredOrganizations = organizations.filter((org) => {
    const matchesType = filterType === "all" || org.type === filterType;
    const matchesStatus = filterStatus === "all" || org.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // İstatistikler
  const stats = {
    total: organizations.length,
    active: organizations.filter((o) => o.status === "active").length,
    planning: organizations.filter((o) => o.status === "planning").length,
    completed: organizations.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizasyonlar</h1>
          <p className="text-slate-500 mt-1">
            Etkinliklerinizi ve organizasyonlarınızı yönetin
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Icon icon="heroicons:plus" className="text-lg" />
          Yeni Organizasyon
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon
                icon="heroicons:calendar-days"
                className="text-xl text-slate-600"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Toplam</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon icon="heroicons:play" className="text-xl text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-xs text-slate-500">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon
                icon="heroicons:clipboard-document-list"
                className="text-xl text-blue-600"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.planning}
              </p>
              <p className="text-xs text-slate-500">Planlama</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Icon
                icon="heroicons:check-badge"
                className="text-xl text-purple-600"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-500">Tamamlanan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Icon
              icon="heroicons:magnifying-glass"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Organizasyon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">Tüm Türler</option>
            {Object.entries(organizationTypes).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Icon
              icon="heroicons:calendar-days"
              className="text-3xl text-slate-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery || filterType !== "all" || filterStatus !== "all"
              ? "Organizasyon bulunamadı"
              : "Henüz organizasyon yok"}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery || filterType !== "all" || filterStatus !== "all"
              ? "Filtreleri değiştirerek tekrar deneyin"
              : "İlk organizasyonunuzu oluşturarak başlayın"}
          </p>
          {!searchQuery && filterType === "all" && filterStatus === "all" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Icon icon="heroicons:plus" />
              Organizasyon Oluştur
            </button>
          )}
        </div>
      )}

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teams={teams}
      />
    </div>
  );
}
