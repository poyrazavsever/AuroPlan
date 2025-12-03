"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  updateOrganizationStatus,
  deleteOrganization,
} from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";
import EditOrganizationModal from "./EditOrganizationModal";
import type { OrganizationWithRelations } from "@/types/supabase";

type OrganizationHeaderProps = {
  organization: OrganizationWithRelations;
  progress: number;
  canManage: boolean;
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
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: "Taslak", color: "text-slate-600", bgColor: "bg-slate-100" },
  planning: {
    label: "Planlama",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  active: { label: "Aktif", color: "text-green-700", bgColor: "bg-green-100" },
  completed: {
    label: "Tamamlandı",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  cancelled: { label: "İptal", color: "text-red-700", bgColor: "bg-red-100" },
};

const statusOptions = [
  { value: "draft", label: "Taslak" },
  { value: "planning", label: "Planlama" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
];

export default function OrganizationHeader({
  organization,
  progress,
  canManage,
}: OrganizationHeaderProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeInfo = typeConfig[organization.type] || typeConfig.other;
  const statusInfo = statusConfig[organization.status] || statusConfig.draft;

  // Tarih formatla
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Etkinliğe kalan süre
  const getTimeRemaining = () => {
    if (!organization.start_date) return null;
    const now = new Date();
    const start = new Date(organization.start_date);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) {
      if (organization.end_date) {
        const end = new Date(organization.end_date);
        if (now < end) return "Devam Ediyor";
      }
      return "Geçmiş";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateOrganizationStatus(organization.id, status);
      toast.success("Durum güncellendi");
      setIsStatusMenuOpen(false);
    } catch (error) {
      toast.error("Durum güncellenemedi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu organizasyonu silmek istediğinizden emin misiniz?"))
      return;

    setIsDeleting(true);
    try {
      await deleteOrganization(organization.id);
      toast.success("Organizasyon silindi");
      router.push("/dashboard/organizations");
    } catch (error) {
      toast.error("Organizasyon silinemedi");
      setIsDeleting(false);
    }
  };

  const timeRemaining = getTimeRemaining();

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div
          className="h-48 relative"
          style={{
            background: organization.cover_image_url
              ? `url(${organization.cover_image_url}) center/cover`
              : `linear-gradient(135deg, ${organization.color_theme}30, ${organization.color_theme}60)`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.color}`}
            >
              <Icon icon={typeInfo.icon} />
              {typeInfo.label}
            </span>
          </div>

          {/* Status & Actions */}
          {canManage && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.label}
                  <Icon icon="heroicons:chevron-down" className="text-xs" />
                </button>

                {isStatusMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsStatusMenuOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            organization.status === option.value
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
              >
                <Icon icon="heroicons:pencil" className="text-slate-700" />
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 bg-white/90 hover:bg-red-50 rounded-full transition-colors"
              >
                <Icon
                  icon={isDeleting ? "heroicons:arrow-path" : "heroicons:trash"}
                  className={`${
                    isDeleting ? "animate-spin text-slate-400" : "text-red-600"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Logo */}
          {organization.logo_url && (
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
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
        <div className={`p-6 ${organization.logo_url ? "pt-12" : "pt-6"}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {organization.name}
              </h1>
              {organization.teams && (
                <p className="text-slate-500 mt-1">{organization.teams.name}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                {organization.start_date && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon="heroicons:calendar" />
                    <span>
                      {formatDate(organization.start_date)}
                      {organization.end_date &&
                        organization.end_date !== organization.start_date &&
                        ` - ${formatDate(organization.end_date)}`}
                    </span>
                  </div>
                )}
                {organization.location_name && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon="heroicons:map-pin" />
                    <span>{organization.location_name}</span>
                  </div>
                )}
                {organization.location_type === "online" && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon="heroicons:globe-alt" />
                    <span>Online</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress & Countdown */}
            <div className="flex flex-col items-end gap-3">
              {/* Countdown */}
              {timeRemaining &&
                organization.status !== "completed" &&
                organization.status !== "cancelled" && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {timeRemaining === "Devam Ediyor" ||
                      timeRemaining === "Geçmiş"
                        ? ""
                        : "Etkinliğe Kalan"}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        timeRemaining === "Devam Ediyor"
                          ? "text-green-600"
                          : timeRemaining === "Geçmiş"
                          ? "text-slate-400"
                          : "text-blue-600"
                      }`}
                    >
                      {timeRemaining}
                    </p>
                  </div>
                )}

              {/* Progress */}
              <div className="w-48">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500">İlerleme</span>
                  <span className="font-bold text-slate-700">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: organization.color_theme,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditOrganizationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organization={organization}
      />
    </>
  );
}
