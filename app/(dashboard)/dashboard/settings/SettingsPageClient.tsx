"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  updateNotificationSettings,
  updateAppearanceSettings,
  updatePrivacySettings,
  changePassword,
  deleteAccount,
  exportUserData,
} from "./actions";

interface SettingsPageClientProps {
  user: any;
  profile: any;
  settings: any;
  activeTab: string;
}

// Toggle Switch Bileşeni
function ToggleSwitch({
  name,
  defaultChecked,
  label,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
  description?: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <div className="flex-1">
        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
          {label}
        </div>
        {description && (
          <div className="text-sm text-slate-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only peer"
        />
        <div
          onClick={() => setChecked(!checked)}
          className={`w-11 h-6 rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    </label>
  );
}

export default function SettingsPageClient({
  user,
  profile,
  settings,
  activeTab,
}: SettingsPageClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: "account", label: "Hesap", icon: "heroicons:user-circle" },
    { id: "notifications", label: "Bildirimler", icon: "heroicons:bell" },
    { id: "appearance", label: "Görünüm", icon: "heroicons:paint-brush" },
    { id: "privacy", label: "Gizlilik", icon: "heroicons:eye-slash" },
    { id: "security", label: "Güvenlik", icon: "heroicons:shield-check" },
    { id: "data", label: "Veri Yönetimi", icon: "heroicons:circle-stack" },
  ];

  const handleNotificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateNotificationSettings(formData);
      toast.success("Bildirim ayarları kaydedildi");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppearanceSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateAppearanceSettings(formData);
      toast.success("Görünüm ayarları kaydedildi");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updatePrivacySettings(formData);
      toast.success("Gizlilik ayarları kaydedildi");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await changePassword(formData);
      toast.success("Şifre başarıyla değiştirildi");
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.message || "Şifre değiştirilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auroplan-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Verileriniz indirildi");
    } catch (error) {
      toast.error("Veriler dışa aktarılamadı");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("Hesap silme talebi alındı");
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Hesap silinemedi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center text-sm text-slate-500 mb-4">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
          <Icon icon="heroicons:chevron-right" className="mx-2 text-xs" />
          <span className="font-semibold text-slate-900">Ayarlar</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-500 text-sm mt-1">
          Hesap, bildirim ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol Menü */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sticky top-24">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/dashboard/settings?tab=${tab.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon icon={tab.icon} className="text-xl" />
                <span className="font-medium">{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sağ İçerik */}
        <div className="flex-1 space-y-6">
          {/* HESAP AYARLARI */}
          {activeTab === "account" && (
            <>
              {/* Profil Özeti */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Hesap Bilgileri
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile?.full_name?.charAt(0) || user.email?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {profile?.full_name || "İsimsiz Kullanıcı"}
                    </h3>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Katılım:{" "}
                      {new Date(user.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="ml-auto px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Profili Düzenle
                  </Link>
                </div>
              </div>

              {/* Hesap Durumu */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Hesap Durumu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Icon icon="heroicons:check-circle-solid" />
                      <span className="font-medium">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-500">Hesap durumu</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Icon icon="heroicons:bolt-solid" />
                      <span className="font-medium">
                        Level {profile?.level || 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {profile?.total_xp || 0} XP
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                      <Icon icon="heroicons:star-solid" />
                      <span className="font-medium">Ücretsiz Plan</span>
                    </div>
                    <p className="text-sm text-slate-500">Mevcut plan</p>
                  </div>
                </div>
              </div>

              {/* E-posta Değiştirme */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  E-posta Adresi
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      E-posta değiştirmek için destek ekibiyle iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* BİLDİRİM AYARLARI */}
          {activeTab === "notifications" && (
            <form onSubmit={handleNotificationSubmit}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Bildirim Tercihleri
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Hangi bildirimleri almak istediğinizi seçin.
                </p>

                <div className="space-y-1 divide-y divide-slate-100">
                  <ToggleSwitch
                    name="email_notifications"
                    defaultChecked={settings?.email_notifications ?? true}
                    label="E-posta Bildirimleri"
                    description="Önemli güncellemeler için e-posta alın"
                  />
                  <ToggleSwitch
                    name="push_notifications"
                    defaultChecked={settings?.push_notifications ?? true}
                    label="Anlık Bildirimler"
                    description="Tarayıcı bildirimleri"
                  />
                  <ToggleSwitch
                    name="task_reminders"
                    defaultChecked={settings?.task_reminders ?? true}
                    label="Görev Hatırlatıcıları"
                    description="Yaklaşan ve geciken görevler için hatırlatma"
                  />
                  <ToggleSwitch
                    name="achievement_notifications"
                    defaultChecked={settings?.achievement_notifications ?? true}
                    label="Başarım Bildirimleri"
                    description="Yeni başarım kazandığınızda bildirim"
                  />
                  <ToggleSwitch
                    name="team_updates"
                    defaultChecked={settings?.team_updates ?? true}
                    label="Takım Güncellemeleri"
                    description="Takım aktiviteleri hakkında bildirim"
                  />
                  <ToggleSwitch
                    name="weekly_digest"
                    defaultChecked={settings?.weekly_digest ?? true}
                    label="Haftalık Özet"
                    description="Her hafta performans özetinizi alın"
                  />
                  <ToggleSwitch
                    name="streak_reminders"
                    defaultChecked={settings?.streak_reminders ?? true}
                    label="Streak Hatırlatıcısı"
                    description="Streak'inizi kaybetmemek için günlük hatırlatma"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Icon icon="svg-spinners:180-ring" />}
                    Kaydet
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* GÖRÜNÜM AYARLARI */}
          {activeTab === "appearance" && (
            <form onSubmit={handleAppearanceSubmit}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Görünüm Tercihleri
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Uygulama görünümünü özelleştirin.
                </p>

                <div className="space-y-6">
                  {/* Tema */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "light",
                          label: "Açık",
                          icon: "heroicons:sun",
                        },
                        {
                          value: "dark",
                          label: "Koyu",
                          icon: "heroicons:moon",
                        },
                        {
                          value: "system",
                          label: "Sistem",
                          icon: "heroicons:computer-desktop",
                        },
                      ].map((theme) => (
                        <label
                          key={theme.value}
                          className="relative cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={theme.value}
                            defaultChecked={
                              settings?.theme === theme.value ||
                              theme.value === "light"
                            }
                            className="peer sr-only"
                          />
                          <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center">
                            <Icon
                              icon={theme.icon}
                              className="text-2xl mx-auto mb-2 text-slate-600 peer-checked:text-blue-600"
                            />
                            <span className="text-sm font-medium">
                              {theme.label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dil */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dil
                    </label>
                    <select
                      name="language"
                      defaultValue={settings?.language || "tr"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Tarih Formatı */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tarih Formatı
                    </label>
                    <select
                      name="date_format"
                      defaultValue={settings?.date_format || "DD/MM/YYYY"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DD/MM/YYYY">31/12/2025</option>
                      <option value="MM/DD/YYYY">12/31/2025</option>
                      <option value="YYYY-MM-DD">2025-12-31</option>
                    </select>
                  </div>

                  {/* Saat Formatı */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Saat Formatı
                    </label>
                    <select
                      name="time_format"
                      defaultValue={settings?.time_format || "24h"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="24h">24 Saat (14:30)</option>
                      <option value="12h">12 Saat (2:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Icon icon="svg-spinners:180-ring" />}
                    Kaydet
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* GİZLİLİK AYARLARI */}
          {activeTab === "privacy" && (
            <form onSubmit={handlePrivacySubmit}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Gizlilik Ayarları
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Profilinizin ve verilerinizin görünürlüğünü kontrol edin.
                </p>

                <div className="space-y-6">
                  {/* Profil Görünürlüğü */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profil Görünürlüğü
                    </label>
                    <select
                      name="profile_visibility"
                      defaultValue={settings?.profile_visibility || "team"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Herkese Açık</option>
                      <option value="team">Sadece Takım Üyeleri</option>
                      <option value="private">Gizli</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      Profilinizi kimlerin görebileceğini belirleyin.
                    </p>
                  </div>

                  <div className="space-y-1 divide-y divide-slate-100">
                    <ToggleSwitch
                      name="show_activity"
                      defaultChecked={settings?.show_activity ?? true}
                      label="Aktivite Durumu"
                      description="Son aktivitenizin görünmesine izin verin"
                    />
                    <ToggleSwitch
                      name="show_achievements"
                      defaultChecked={settings?.show_achievements ?? true}
                      label="Başarımları Göster"
                      description="Kazandığınız başarımların profilinizde görünmesi"
                    />
                    <ToggleSwitch
                      name="show_xp"
                      defaultChecked={settings?.show_xp ?? true}
                      label="XP ve Level Göster"
                      description="XP puanınızın ve level'ınızın görünmesi"
                    />
                    <ToggleSwitch
                      name="show_leaderboard_rank"
                      defaultChecked={settings?.show_leaderboard_rank ?? true}
                      label="Sıralamada Görün"
                      description="Leaderboard'da isminizin görünmesi"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Icon icon="svg-spinners:180-ring" />}
                    Kaydet
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* GÜVENLİK AYARLARI */}
          {activeTab === "security" && (
            <>
              {/* Şifre Değiştirme */}
              <form onSubmit={handlePasswordSubmit}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">
                    Şifre Değiştir
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Güvenliğiniz için güçlü bir şifre kullanın.
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Şifreyi Onayla
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Şifre en az 8 karakter olmalıdır.
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Icon icon="svg-spinners:180-ring" />}
                      Şifreyi Değiştir
                    </button>
                  </div>
                </div>
              </form>

              {/* Aktif Oturumlar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Aktif Oturumlar
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Hesabınıza bağlı cihazları görüntüleyin.
                </p>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="heroicons:computer-desktop"
                      className="text-xl text-green-600"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Bu Cihaz</div>
                    <div className="text-sm text-slate-500">Şu an aktif</div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    Aktif
                  </span>
                </div>
              </div>

              {/* İki Faktörlü Kimlik Doğrulama */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">
                      İki Faktörlü Kimlik Doğrulama
                    </h2>
                    <p className="text-sm text-slate-500">
                      Hesabınızı ekstra güvenlik katmanı ile koruyun.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">
                    Yakında
                  </span>
                </div>
              </div>
            </>
          )}

          {/* VERİ YÖNETİMİ */}
          {activeTab === "data" && (
            <>
              {/* Veriyi Dışa Aktar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Verilerimi İndir
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Tüm verilerinizin bir kopyasını JSON formatında indirin.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Icon icon="heroicons:arrow-down-tray" />
                  Verileri İndir
                </button>
              </div>

              {/* Hesap Silme */}
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-red-600 mb-1">
                  Hesabı Sil
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir.
                  Bu işlem geri alınamaz.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="heroicons:trash" />
                    Hesabımı Sil
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-medium mb-4">
                      Hesabınızı silmek istediğinizden emin misiniz? Bu işlem
                      geri alınamaz!
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Evet, Hesabımı Sil
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
