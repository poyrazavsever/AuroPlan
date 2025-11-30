import { Icon } from "@iconify/react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden flex-col justify-between p-12 text-white">

        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="absolute top-[20%] right-0 w-[80%] h-[1px] bg-gradient-to-l from-white/20 to-transparent rotate-12"></div>
          <div className="absolute bottom-[30%] left-0 w-[70%] h-[1px] bg-gradient-to-r from-white/20 to-transparent -rotate-12"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Icon
                icon="heroicons:bolt-solid"
                className="text-2xl text-white"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">Aura Plan</span>
          </Link>
        </div>

        {/* Mesaj */}
        <div className="relative z-10 mb-20">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Bireyler ve Takımlar İçin <br /> Tasarlandı
          </h1>
          <p className="text-blue-100 text-lg font-light max-w-md">
            Analitikleri görün, verilerinizi büyütün ve dünyanın her yerinden
            uzaktan çalışın.
          </p>
        </div>

        {/* Alt Kısım (Mockup Temsili - Küçük Dashboard Kartı) */}
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 rounded-t-xl p-4 shadow-2xl translate-y-12 translate-x-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
          </div>
          <div className="space-y-3">
            <div className="h-2 w-3/4 bg-white/20 rounded"></div>
            <div className="h-2 w-1/2 bg-white/20 rounded"></div>
            <div className="h-20 w-full bg-white/5 rounded mt-4 border border-white/5"></div>
          </div>
        </div>
      </div>

      {/* --- SAĞ TARAF (Form Alanı) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-8 md:p-16">
        <div className="w-full max-w-[400px] space-y-8">{children}</div>
      </div>
    </div>
  );
}
