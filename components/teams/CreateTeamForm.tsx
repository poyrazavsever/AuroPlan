"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createTeam } from "@/app/(dashboard)/dashboard/teams/action";
import toast from "react-hot-toast";

export default function CreateTeamForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await createTeam(formData);
      toast.success("Takım başarıyla oluşturuldu ve üyeler eklendi! 🚀");
    } catch (error: any) {
      // Hata mesajını göster
      toast.error(error.message || "Bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Takım Adı */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-bold text-slate-700 mb-2"
        >
          Takım Adı
        </label>
        <div className="relative">
          <input
            type="text"
            name="name"
            id="name"
            required
            minLength={3}
            placeholder="Örn: Pazarlama Ekibi..."
            className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-900"
          />
          <Icon
            icon="heroicons:user-group"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
          />
        </div>
      </div>

      {/* Üye Davetleri */}
      <div>
        <label
          htmlFor="members"
          className="block text-sm font-bold text-slate-700 mb-2"
        >
          Üye Ekle{" "}
          <span className="text-slate-400 font-normal">(Opsiyonel)</span>
        </label>
        <div className="relative">
          <textarea
            name="members"
            id="members"
            rows={3}
            placeholder="ornek@mail.com, diger@mail.com"
            className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-900 resize-none"
          />
          <Icon
            icon="heroicons:envelope"
            className="absolute left-4 top-4 text-slate-400 text-xl"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          E-posta adreslerini virgül ile ayırarak yazın. Kullanıcıların sisteme
          kayıtlı olması gerekir.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <Icon icon="svg-spinners:180-ring" className="text-xl" />
        ) : (
          <>
            Takımı Kur ve Başla
            <Icon icon="heroicons:arrow-right" />
          </>
        )}
      </button>
    </form>
  );
}
