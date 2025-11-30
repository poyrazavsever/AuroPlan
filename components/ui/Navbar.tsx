import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/server";
import UserMenu from "./UserMenu";
import NavbarLinks from "./NavbarLinks";

export default async function Navbar() {
  const supabase = await createClient();

  // Kullanıcıyı getir
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-border h-[80px]">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center gap-12 h-full">
          {/* Logo Alanı */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-50"
          >
            <div className="relative w-9 h-9 overflow-hidden rounded-lg">
              <Image
                src="/Logos/JustLogo.jpg"
                alt="Aura Plan Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">
              Aura Plan
            </span>
          </Link>

          {/* Menü - Masaüstü */}
          {user ? (
            // --- KULLANICI GİRİŞ YAPMIŞSA BASİT MENÜ ---
            <nav className="hidden md:flex gap-6 text-sm font-bold text-muted h-full items-center">
              <Link
                href="/dashboard"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Icon icon="heroicons:squares-2x2" />
                Panom
              </Link>
              <Link
                href="/dashboard/tasks"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Icon icon="heroicons:list-bullet" />
                Görevler
              </Link>
              <Link
                href="/dashboard/learn"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Icon icon="heroicons:academic-cap" />
                Öğrenme
              </Link>
            </nav>
          ) : (
            // --- ZİYARETÇİ İSE MEGA MENU ---
            <NavbarLinks />
          )}
        </div>

        {/* Aksiyon Alanı (Sağ Taraf) */}
        <div className="flex gap-4 items-center relative z-50">
          {user ? (
            // Kullanıcı varsa UserMenu göster
            <UserMenu user={user} />
          ) : (
            // Kullanıcı yoksa Giriş/Kayıt butonlarını göster
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
              >
                Ücretsiz Dene
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
