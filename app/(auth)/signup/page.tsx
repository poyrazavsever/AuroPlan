import Link from "next/link";
import { Icon } from "@iconify/react";

export default function SignupPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-foreground">Kayıt Ol</h2>
        <p className="text-muted">
          Aura Plan'a katılın ve işlerinizi düzenleyin.
        </p>
      </div>

      <form className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            className="text-sm font-semibold text-foreground/80"
            htmlFor="fullName"
          >
            Ad Soyad
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Adınız Soyadınız"
            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-0"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label
            className="text-sm font-semibold text-foreground/80"
            htmlFor="email"
          >
            Email adresi
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@mail.com"
            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-0"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label
            className="text-sm font-semibold text-foreground/80"
            htmlFor="password"
          >
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="En az 6 karakter"
            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-0"
          />
        </div>

        {/* Terms */}
        <div className="text-xs text-muted leading-relaxed">
          Kayıt olarak{" "}
          <Link href="#" className="text-primary hover:underline">
            Hizmet Şartları
          </Link>{" "}
          ve{" "}
          <Link href="#" className="text-primary hover:underline">
            Gizlilik Politikası
          </Link>
          'nı kabul etmiş olursunuz.
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex justify-center items-center"
        >
          Hesap Oluştur
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">veya</span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        className="w-full py-3 bg-white border border-border text-foreground font-semibold rounded-lg hover:bg-surface transition-colors flex justify-center items-center gap-2"
      >
        <Icon icon="logos:google-icon" className="text-xl" />
        <span className="text-sm">Google ile kayıt ol</span>
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted mt-6">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Giriş Yapın
        </Link>
      </p>
    </>
  );
}
