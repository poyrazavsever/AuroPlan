"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  updateMilestoneStatus,
  deleteMilestone,
} from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";
import type { OrganizationMilestone } from "@/types/supabase";

type OrganizationMilestonesListProps = {
  milestones: OrganizationMilestone[];
  organizationId: string;
  canEdit: boolean;
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string; bgColor: string }
> = {
  pending: {
    label: "Bekliyor",
    color: "text-slate-600",
    icon: "heroicons:clock",
    bgColor: "bg-slate-100",
  },
  in_progress: {
    label: "Devam Ediyor",
    color: "text-blue-600",
    icon: "heroicons:arrow-path",
    bgColor: "bg-blue-100",
  },
  completed: {
    label: "Tamamlandı",
    color: "text-green-600",
    icon: "heroicons:check-circle",
    bgColor: "bg-green-100",
  },
  cancelled: {
    label: "İptal",
    color: "text-red-600",
    icon: "heroicons:x-circle",
    bgColor: "bg-red-100",
  },
};

export default function OrganizationMilestonesList({
  milestones,
  organizationId,
  canEdit,
}: OrganizationMilestonesListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      await updateMilestoneStatus(id, status, organizationId);
      toast.success("Durum güncellendi");
    } catch (error) {
      toast.error("Güncellenemedi");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kilometre taşını silmek istediğinizden emin misiniz?"))
      return;

    setLoadingId(id);
    try {
      await deleteMilestone(id, organizationId);
      toast.success("Silindi");
    } catch (error) {
      toast.error("Silinemedi");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon
          icon="heroicons:flag"
          className="text-4xl text-slate-300 mx-auto mb-3"
        />
        <p className="text-slate-500">Henüz kilometre taşı eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const status = statusConfig[milestone.status] || statusConfig.pending;
        const isLoading = loadingId === milestone.id;
        const isOverdue =
          milestone.due_date &&
          new Date(milestone.due_date) < new Date() &&
          milestone.status !== "completed";

        return (
          <div
            key={milestone.id}
            className={`relative flex gap-4 ${
              index < milestones.length - 1 ? "pb-4" : ""
            }`}
          >
            {/* Timeline Line */}
            {index < milestones.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Status Icon */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status.bgColor}`}
              style={
                milestone.color
                  ? { backgroundColor: `${milestone.color}20` }
                  : {}
              }
            >
              <Icon
                icon={milestone.icon || status.icon}
                className={`text-lg ${status.color}`}
                style={milestone.color ? { color: milestone.color } : {}}
              />
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-50 rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {milestone.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {milestone.due_date && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? "text-red-600" : "text-slate-500"
                        }`}
                      >
                        <Icon icon="heroicons:calendar" />
                        {formatDate(milestone.due_date)}
                        {isOverdue && " (Gecikmiş)"}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 ${status.color}`}>
                      <Icon icon={status.icon} />
                      {status.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {milestone.progress > 0 &&
                    milestone.status !== "completed" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">İlerleme</span>
                          <span className="font-medium">
                            {milestone.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${milestone.progress}%`,
                              backgroundColor: milestone.color || undefined,
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {milestone.status !== "completed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(milestone.id, "completed")
                        }
                        disabled={isLoading}
                        className="p-1.5 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                        title="Tamamla"
                      >
                        <Icon icon="heroicons:check" />
                      </button>
                    )}
                    {milestone.status === "pending" && (
                      <button
                        onClick={() =>
                          handleStatusChange(milestone.id, "in_progress")
                        }
                        disabled={isLoading}
                        className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                        title="Başlat"
                      >
                        <Icon icon="heroicons:play" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      disabled={isLoading}
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Sil"
                    >
                      <Icon icon="heroicons:trash" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
