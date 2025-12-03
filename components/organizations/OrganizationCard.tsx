"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { OrganizationWithRelations } from "@/types/supabase";

type OrganizationCardProps = {
  organization: OrganizationWithRelations;
};

// Organizasyon türü config
const typeConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
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

// Durum config
const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  draft: {
    label: "Taslak",
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  planning: {
    label: "Planlama",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  active: {
    label: "Aktif",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  completed: {
    label: "Tamamlandı",
    color: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
  cancelled: {
    label: "İptal",
    color: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

// Konum türü config
const locationTypeConfig: Record<string, { label: string; icon: string }> = {
  physical: { label: "Fiziksel", icon: "heroicons:map-pin" },
  online: { label: "Online", icon: "heroicons:globe-alt" },
  hybrid: { label: "Hibrit", icon: "heroicons:arrows-right-left" },
};

export default function OrganizationCard({
  organization,
}: OrganizationCardProps) {
  const typeInfo = typeConfig[organization.type] || typeConfig.other;
  const statusInfo = statusConfig[organization.status] || statusConfig.draft;
  const locationInfo =
    locationTypeConfig[organization.location_type] ||
    locationTypeConfig.physical;

  // Tarih formatla
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const startDate = formatDate(organization.start_date);
  const endDate = formatDate(organization.end_date);

  // Üye sayısı
  const memberCount = organization.organization_members?.length || 0;

  // Milestone ilerlemesi
  const milestones = organization.organization_milestones || [];
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  return (
    <Link
      href={`/dashboard/organizations/${organization.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200"
    >
      {/* Cover Image veya Gradient */}
      <div
        className="h-32 relative"
        style={{
          background: organization.cover_image_url
            ? `url(${organization.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${organization.color_theme}20, ${organization.color_theme}40)`,
        }}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
            ></span>
            {statusInfo.label}
          </span>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
          >
            <Icon icon={typeInfo.icon} className="text-sm" />
            {typeInfo.label}
          </span>
        </div>

        {/* Logo */}
        {organization.logo_url && (
          <div className="absolute -bottom-6 left-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-md overflow-hidden border-2 border-white">
              <img
                src={organization.logo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${organization.logo_url ? "pt-8" : "pt-4"}`}>
        {/* Title & Team */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {organization.name}
          </h3>
          {organization.teams && (
            <p className="text-xs text-slate-500 mt-0.5">
              {organization.teams.name}
            </p>
          )}
        </div>

        {/* Description */}
        {organization.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {organization.description}
          </p>
        )}

        {/* Date & Location */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          {startDate && (
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:calendar" className="text-sm" />
              <span>
                {startDate}
                {endDate && endDate !== startDate && ` - ${endDate}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Icon icon={locationInfo.icon} className="text-sm" />
            <span>{organization.location_name || locationInfo.label}</span>
          </div>
        </div>

        {/* Progress Bar (Milestones) */}
        {milestones.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">İlerleme</span>
              <span className="font-medium text-slate-700">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: organization.color_theme,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:users" className="text-sm" />
              <span>{memberCount} üye</span>
            </div>
            {milestones.length > 0 && (
              <div className="flex items-center gap-1">
                <Icon icon="heroicons:flag" className="text-sm" />
                <span>
                  {completedMilestones}/{milestones.length}
                </span>
              </div>
            )}
          </div>
          <Icon
            icon="heroicons:arrow-right"
            className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}
