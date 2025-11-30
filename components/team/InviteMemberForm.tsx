"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { addMember } from "@/app/(dashboard)/dashboard/team/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // 1. Router'ı ekle

export default function InviteMemberForm({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter(); // 2. Hook'u başlat

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      formData.append("teamId", teamId);

      await addMember(formData);

      toast.success("Kullanıcı takıma eklendi! 🎉");
      formRef.current?.reset();

      // 3. KRİTİK: Sayfayı yenile ki tablo güncellensin
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Yeni Üye Davet Et
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Takımınıza katılmasını istediğiniz kişinin e-posta adresini girin.
      </p>

      <form ref={formRef} action={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Icon
            icon="heroicons:envelope"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="ornek@email.com"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Icon icon="svg-spinners:180-ring" />
          ) : (
            <Icon icon="heroicons:plus" />
          )}
          Davet Et
        </button>
      </form>
      <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
        <Icon icon="heroicons:information-circle" />
        Not: Kişinin Aura Plan'a kayıtlı olması gerekir.
      </p>
    </div>
  );
}
