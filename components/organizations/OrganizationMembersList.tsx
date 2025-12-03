"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import {
  updateMemberRole,
  removeOrganizationMember,
} from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";
import type { OrganizationMemberWithProfile } from "@/types/supabase";

type OrganizationMembersListProps = {
  members: OrganizationMemberWithProfile[];
  organizationId: string;
  canManage: boolean;
  currentUserId: string;
};

const roleConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  owner: { label: "Sahip", color: "text-amber-700", bgColor: "bg-amber-100" },
  organizer: {
    label: "Organizatör",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  coordinator: {
    label: "Koordinatör",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  volunteer: {
    label: "Gönüllü",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  member: { label: "Üye", color: "text-slate-600", bgColor: "bg-slate-100" },
};

const departmentConfig: Record<string, { label: string; icon: string }> = {
  sponsorship: { label: "Sponsorluk", icon: "heroicons:building-office" },
  logistics: { label: "Lojistik", icon: "heroicons:truck" },
  content: { label: "İçerik", icon: "heroicons:document-text" },
  technical: { label: "Teknik", icon: "heroicons:code-bracket" },
  marketing: { label: "Pazarlama", icon: "heroicons:megaphone" },
  finance: { label: "Finans", icon: "heroicons:banknotes" },
};

export default function OrganizationMembersList({
  members,
  organizationId,
  canManage,
  currentUserId,
}: OrganizationMembersListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRoleChange = async (
    memberId: string,
    role: string,
    department?: string
  ) => {
    setLoadingId(memberId);
    try {
      await updateMemberRole(memberId, role, organizationId, department);
      toast.success("Rol güncellendi");
      setEditingId(null);
    } catch (error) {
      toast.error("Güncellenemedi");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (
      !confirm(`${memberName} adlı üyeyi çıkarmak istediğinizden emin misiniz?`)
    )
      return;

    setLoadingId(memberId);
    try {
      await removeOrganizationMember(memberId, organizationId);
      toast.success("Üye çıkarıldı");
    } catch (error) {
      toast.error("Çıkarılamadı");
    } finally {
      setLoadingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-6">
        <Icon
          icon="heroicons:users"
          className="text-3xl text-slate-300 mx-auto mb-2"
        />
        <p className="text-slate-500 text-sm">Henüz üye yok</p>
      </div>
    );
  }

  // Üyeleri role göre sırala
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = [
      "owner",
      "organizer",
      "coordinator",
      "volunteer",
      "member",
    ];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  return (
    <div className="space-y-3">
      {sortedMembers.map((member) => {
        const role = roleConfig[member.role] || roleConfig.member;
        const department = member.department
          ? departmentConfig[member.department]
          : null;
        const isLoading = loadingId === member.id;
        const isEditing = editingId === member.id;
        const isCurrentUser = member.user_id === currentUserId;
        const isOwner = member.role === "owner";

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
              {member.profiles?.avatar_url ? (
                <Image
                  src={member.profiles.avatar_url}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                  {member.profiles?.full_name?.[0] || "?"}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 truncate">
                  {member.profiles?.full_name || "İsimsiz"}
                </p>
                {isCurrentUser && (
                  <span className="text-xs text-slate-400">(Sen)</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${role.bgColor} ${role.color}`}
                >
                  {role.label}
                </span>
                {department && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Icon icon={department.icon} className="text-xs" />
                    {department.label}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {canManage && !isOwner && !isCurrentUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value)
                      }
                      disabled={isLoading}
                      className="text-xs px-2 py-1 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="organizer">Organizatör</option>
                      <option value="coordinator">Koordinatör</option>
                      <option value="volunteer">Gönüllü</option>
                      <option value="member">Üye</option>
                    </select>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Icon
                        icon="heroicons:x-mark"
                        className="text-slate-500"
                      />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(member.id)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                      title="Rolü Değiştir"
                    >
                      <Icon icon="heroicons:pencil" />
                    </button>
                    <button
                      onClick={() =>
                        handleRemove(
                          member.id,
                          member.profiles?.full_name || "Üye"
                        )
                      }
                      disabled={isLoading}
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Çıkar"
                    >
                      <Icon icon="heroicons:user-minus" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
