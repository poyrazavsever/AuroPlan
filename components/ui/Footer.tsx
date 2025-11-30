import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- ÜST KISIM (Grid Yapısı) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* 1. Marka ve Hakkında (2 Kolon Genişliğinde) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                <Image
                  src="/Logos/JustLogo.jpg"
                  alt="Aura Plan Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                Aura Plan
              </span>
            </Link>
            <p className="text-muted leading-relaxed max-w-xs">
              Bireyler ve takımlar için yeni nesil iş yönetim platformu. İş
              akışınızı düzenleyin, verimliliğinizi artırın.
            </p>

            {/* Sosyal Medya İkonları */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-colors"
              >
                <Icon icon="mdi:linkedin" className="text-lg" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-colors"
              >
                <Icon icon="mdi:twitter" className="text-lg" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-colors"
              >
                <Icon icon="mdi:instagram" className="text-lg" />
              </a>
            </div>
          </div>

          {/* 2. Kolon: Ürün */}
          <div className="space-y-6">
            <h4 className="font-bold text-foreground">Ürün</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted hover:text-primary transition-colors"
                >
                  Panom
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/tasks"
                  className="text-muted hover:text-primary transition-colors"
                >
                  Görev Yönetimi
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/learn"
                  className="text-muted hover:text-primary transition-colors"
                >
                  Mikro Öğrenme
                </Link>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Raporlar</span>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                  Yakında
                </span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Otomasyon</span>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                  Yakında
                </span>
              </li>
            </ul>
          </div>

          {/* 3. Kolon: Şirket */}
          <div className="space-y-6">
            <h4 className="font-bold text-foreground">Şirket</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Hakkımızda</span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Kariyer</span>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                  Alım Var
                </span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Blog</span>
              </li>
              <li>
                <a
                  href="mailto:support@auraplan.com"
                  className="text-muted hover:text-primary transition-colors"
                >
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Kolon: Kaynaklar */}
          <div className="space-y-6">
            <h4 className="font-bold text-foreground">Kaynaklar</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Topluluk</span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Yardım Merkezi</span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">API Dokümantasyonu</span>
              </li>
              <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <span className="text-muted">Durum (Status)</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </li>
            </ul>
          </div>

          {/* 5. Kolon: Yasal (Mobil için alta kayabilir) */}
          <div className="space-y-6 lg:col-span-1">
            <h4 className="font-bold text-foreground">Yasal</h4>
            <ul className="space-y-4">
              <li className="opacity-50 cursor-not-allowed">
                <span className="text-muted">Gizlilik Politikası</span>
              </li>
              <li className="opacity-50 cursor-not-allowed">
                <span className="text-muted">Kullanım Şartları</span>
              </li>
              <li className="opacity-50 cursor-not-allowed">
                <span className="text-muted">Çerez Politikası</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- ALT KISIM (Copyright & Dil Seçimi) --- */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted font-medium">
            &copy; {new Date().getFullYear()} Aura Plan Inc. Tüm hakları
            saklıdır.
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted hover:text-foreground cursor-pointer transition-colors">
              <Icon icon="heroicons:globe-alt" className="text-lg" />
              <span>Türkçe (TR)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
