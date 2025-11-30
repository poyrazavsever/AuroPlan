"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NavbarLinks() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <nav
      className="hidden md:flex h-full items-center"
      onMouseLeave={() => setIsMegaMenuOpen(false)}
    >
      <div className="flex gap-8 h-full items-center">
        {/* --- ÇÖZÜMLER (Mega Menu Tetikleyici) --- */}
        <div
          className="h-full flex items-center"
          onMouseEnter={() => setIsMegaMenuOpen(true)}
        >
          <button
            className={`text-sm font-bold transition-colors flex items-center gap-1 py-6
              ${
                isMegaMenuOpen
                  ? "text-primary"
                  : "text-muted hover:text-primary"
              }`}
          >
            Çözümler
            <Icon
              icon="heroicons:chevron-down"
              className={`text-xs transition-transform duration-200 ${
                isMegaMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* --- DİĞER LİNKLER (Disabled) --- */}
        <div className="relative group cursor-not-allowed">
          <span className="text-sm font-bold text-muted/50">Kaynaklar</span>
          <span className="absolute -top-3 -right-6 text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
            Yakında
          </span>
        </div>

        <div className="relative group cursor-not-allowed">
          <span className="text-sm font-bold text-muted/50">Fiyatlandırma</span>
        </div>
      </div>

      {/* --- MEGA MENU --- */}
      {/* Absolute pozisyon ile header'ın hemen altına yerleşir */}
      <div
        className={`absolute left-0 top-[80px] w-full bg-white border-t border-b border-border transition-all duration-300 origin-top z-40
          ${
            isMegaMenuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          }`}
        onMouseEnter={() => setIsMegaMenuOpen(true)}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto flex min-h-[320px]">
          {/* SOL KOLON - ÜRÜNLER (Koyu Lacivert) */}
          <div className="w-1/3 bg-primary p-10 text-white">
            <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-6">
              Ürünler
            </h3>
            <div className="space-y-6">
              {/* Aktif Ürün: Görev Yönetimi */}
              <Link href="/dashboard/tasks" className="flex gap-4 group">
                <div className="mt-1">
                  <Icon
                    icon="heroicons:squares-plus"
                    className="text-2xl text-blue-300 group-hover:text-white transition-colors"
                  />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-200 transition-colors">
                    Görev Yöneticisi
                  </div>
                  <div className="text-sm text-blue-200/70 leading-snug mt-1">
                    Bireysel ve takım görevlerini Kanban ile yönetin.
                  </div>
                </div>
              </Link>

              {/* Aktif Ürün: Mikro Öğrenme */}
              <Link href="/dashboard/learn" className="flex gap-4 group">
                <div className="mt-1">
                  <Icon
                    icon="heroicons:academic-cap"
                    className="text-2xl text-blue-300 group-hover:text-white transition-colors"
                  />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-200 transition-colors">
                    Mikro Öğrenme
                  </div>
                  <div className="text-sm text-blue-200/70 leading-snug mt-1">
                    Günde 5 dakika ile yetkinliklerinizi geliştirin.
                  </div>
                </div>
              </Link>

              {/* Disabled Ürün */}
              <div className="flex gap-4 opacity-50 cursor-not-allowed">
                <div className="mt-1">
                  <Icon
                    icon="heroicons:chart-bar"
                    className="text-2xl text-blue-300"
                  />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    Analitik Raporlar
                    <span className="text-[9px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded border border-blue-700">
                      Yakında
                    </span>
                  </div>
                  <div className="text-sm text-blue-200/70 leading-snug mt-1">
                    Takım performansını verilerle takip edin.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ORTA KOLON - ENDÜSTRİLER (Açık) */}
          <div className="w-1/3 bg-white p-10 border-r border-border">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-6">
              Sektörler & Kullanım
            </h3>
            <div className="space-y-5">
              <div className="group cursor-not-allowed opacity-60">
                <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                  Yazılım Ekipleri
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    Yakında
                  </span>
                </h4>
                <p className="text-sm text-muted leading-snug">
                  Sprint planlama ve bug takibi için.
                </p>
              </div>

              <div className="group cursor-not-allowed opacity-60">
                <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                  Pazarlama
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    Yakında
                  </span>
                </h4>
                <p className="text-sm text-muted leading-snug">
                  Kampanya süreçlerini tek yerden yönetin.
                </p>
              </div>

              <div className="group cursor-not-allowed opacity-60">
                <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                  Eğitim Kurumları
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    Yakında
                  </span>
                </h4>
                <p className="text-sm text-muted leading-snug">
                  Öğrenci takibi ve müfredat planlama.
                </p>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON - ENTEGRASYONLAR (Açık) */}
          <div className="w-1/3 bg-slate-50 p-10">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-6">
              Entegrasyonlar
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                <Icon icon="logos:slack-icon" className="text-xl" />
                <span className="font-bold text-foreground">Slack</span>
                <span className="text-[9px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 ml-auto">
                  Yakında
                </span>
              </div>
              <div className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                <Icon icon="logos:google-calendar" className="text-xl" />
                <span className="font-bold text-foreground">
                  Google Calendar
                </span>
                <span className="text-[9px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 ml-auto">
                  Yakında
                </span>
              </div>
              <div className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                <Icon icon="logos:notion-icon" className="text-xl" />
                <span className="font-bold text-foreground">Notion</span>
                <span className="text-[9px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 ml-auto">
                  Yakında
                </span>
              </div>
            </div>

            {/* Alt Kutu CTA */}
            <div className="mt-10 p-4 bg-blue-100 border border-blue-200 rounded-lg">
              <h5 className="font-bold text-blue-800 text-sm mb-1">
                Daha fazlasına mı ihtiyacınız var?
              </h5>
              <p className="text-xs text-blue-600 mb-3">
                Kurumsal planlarımız için bizimle iletişime geçin.
              </p>
              <button className="text-xs font-bold bg-white text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors w-full">
                Satış Ekibiyle Görüş
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
