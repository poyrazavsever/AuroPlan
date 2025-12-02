"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { createCustomAchievement } from "@/app/(dashboard)/dashboard/achievements/actions";
import toast from "react-hot-toast";

type Option = { id: string; name: string };

export default function CreateAchievementModal({
  teams,
  projects,
}: {
  teams: Option[];
  projects: Option[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<"team" | "project">("team");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await createCustomAchievement(formData);
      toast.success("Rozet başarıyla oluşturuldu! 🎖️");
      setIsOpen(false);
      formRef.current?.reset();
    } catch (error) {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-slate-900/20"
      >
        <Icon icon="heroicons:plus" className="text-lg" />
        Yeni Rozet Tanımla
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Yeni Başarım Oluştur
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="heroicons:x-mark" className="text-2xl" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              {/* Görsel Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Rozet Görseli (İkon)
                </label>
                <input
                  type="file"
                  name="icon"
                  accept="image/*"
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Başlık ve Puan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Başlık
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="Örn: Sprint Kahramanı"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    XP Değeri
                  </label>
                  <input
                    name="xp"
                    type="number"
                    defaultValue={50}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Kapsam Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Kapsam (Nereye Ait?)
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="team"
                      checked={scope === "team"}
                      onChange={() => setScope("team")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Takım Bazlı</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="project"
                      checked={scope === "project"}
                      onChange={() => setScope("project")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Proje Bazlı</span>
                  </label>
                </div>

                <select
                  name="targetId"
                  required
                  defaultValue="" // DÜZELTME: selected yerine defaultValue eklendi
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                >
                  <option value="" disabled>
                    Seçiniz...
                  </option>{" "}
                  {/* DÜZELTME: selected kaldırıldı */}
                  {scope === "team"
                    ? teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    : projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                </select>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  rows={2}
                  required
                  placeholder="Bu rozet ne için veriliyor?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  {loading ? (
                    <Icon icon="svg-spinners:180-ring" />
                  ) : (
                    <Icon icon="heroicons:check" />
                  )}
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
