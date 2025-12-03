"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { addOrganizationMember } from "@/app/(dashboard)/dashboard/organizations/actions";
import toast from "react-hot-toast";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

type AddOrganizationMemberModalProps = {
  organizationId: string;
  availableMembers: Profile[];
};

const roleOptions = [
  {
    value: "organizer",
    label: "Organizatör",
    description: "Tüm alanlara erişim",
  },
  {
    value: "coordinator",
    label: "Koordinatör",
    description: "Belirli alanlarda yetki",
  },
  { value: "volunteer", label: "Gönüllü", description: "Görev alabilir" },
  { value: "member", label: "Üye", description: "Sadece görüntüleme" },
];

const departmentOptions = [
  { value: "", label: "Seçilmedi" },
  { value: "sponsorship", label: "Sponsorluk" },
  { value: "logistics", label: "Lojistik" },
  { value: "content", label: "İçerik" },
  { value: "technical", label: "Teknik" },
  { value: "marketing", label: "Pazarlama" },
  { value: "finance", label: "Finans" },
];

export default function AddOrganizationMemberModal({
  organizationId,
  availableMembers,
}: AddOrganizationMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = availableMembers.filter(
    (member) =>
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Lütfen bir üye seçin");
      return;
    }

    setIsSubmitting(true);
    try {
      await addOrganizationMember(
        organizationId,
        selectedUserId,
        selectedRole,
        selectedDepartment || undefined
      );
      toast.success("Üye eklendi");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Üye eklenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId("");
    setSelectedRole("member");
    setSelectedDepartment("");
    setSearchQuery("");
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  if (availableMembers.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
        title="Üye Ekle"
      >
        <Icon icon="heroicons:user-plus" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Üye Ekle</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="text-xl text-slate-500"
                />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Search */}
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Üye ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Member List */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    {searchQuery ? "Üye bulunamadı" : "Eklenebilecek üye yok"}
                  </p>
                ) : (
                  filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedUserId(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedUserId === member.id
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                            {member.full_name?.[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">
                          {member.full_name || "İsimsiz"}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                      {selectedUserId === member.id && (
                        <Icon
                          icon="heroicons:check-circle"
                          className="text-blue-600 text-xl"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Role Selection */}
              {selectedUserId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rol
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedRole === role.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <p className="font-medium text-sm text-slate-900">
                            {role.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {role.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Departman (Opsiyonel)
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedUserId}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <Icon icon="heroicons:arrow-path" className="animate-spin" />
                )}
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
