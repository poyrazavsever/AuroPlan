import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* --- HERO SECTION (Mavi Alan) --- */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 pt-32 pb-60 overflow-hidden">
        {/* Arkaplan Dekoratif Efektler (Görseldeki parlamalar) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-3xl mix-blend-overlay"></div>
          {/* Küçük noktalar / Yıldızlar */}
          <div className="absolute top-20 right-40 w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-white/10 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Başlık Grubu */}
          <div className="max-w-3xl mx-auto space-y-6 mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Dijital İş Gücünüzü <br />
              <span className="text-blue-200">Tek Noktadan Yönetin</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Aura Plan ile görevleri organize edin, takımınızı senkronize tutun
              ve mikro öğrenme ile yetkinliklerinizi her gün geliştirin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-blue-800 font-bold rounded-full hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 transform hover:-translate-y-1"
              >
                Hemen Başlayın
              </Link>
              <button className="px-8 py-4 bg-transparent border border-blue-400/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
                <Icon icon="heroicons:play-circle" className="text-2xl" />
                Tanıtımı İzle
              </button>
            </div>
          </div>

          {/* Dashboard Mockup (Merkezi Görsel) */}
          <div className="relative mx-auto max-w-5xl">
            {/* Mockup Çerçevesi */}
            <div className="bg-white rounded-xl shadow-2xl border border-white/10 overflow-hidden relative z-20 mx-4 md:mx-0">
              {/* Browser Header */}
              <div className="bg-slate-50 border-b border-slate-200 h-8 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>

              {/* Mockup İçerik (CSS ile çizilmiş arayüz) */}
              <div className="bg-slate-50 p-6 md:p-8 aspect-[16/9] flex gap-6">
                {/* Sidebar */}
                <div className="hidden md:block w-16 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center py-4 gap-4">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Icon icon="heroicons:home" />
                  </div>
                  <div className="w-8 h-8 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Icon icon="heroicons:list-bullet" />
                  </div>
                  <div className="w-8 h-8 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Icon icon="heroicons:chart-bar" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-white rounded border border-slate-200"></div>
                    <div className="h-8 w-24 bg-blue-600 rounded"></div>
                  </div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-2">
                      <div className="h-2 w-12 bg-slate-100 rounded"></div>
                      <div className="h-6 w-20 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-2">
                      <div className="h-2 w-12 bg-slate-100 rounded"></div>
                      <div className="h-6 w-20 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-10"></div>
                      <div className="h-2 w-12 bg-blue-100 rounded"></div>
                      <div className="h-6 w-20 bg-blue-200 rounded"></div>
                    </div>
                  </div>
                  {/* Chart Area */}
                  <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm h-40 flex items-end justify-between px-6 pb-4 gap-2">
                    {[40, 70, 45, 90, 60, 75, 50, 80].map((h, i) => (
                      <div
                        key={i}
                        className="w-full bg-blue-50 rounded-t hover:bg-blue-100 transition-colors relative group"
                      >
                        <div
                          style={{ height: `${h}%` }}
                          className="absolute bottom-0 w-full bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors"
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Arkasındaki Dekoratif Şekiller */}
            <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-amber-400 rounded-2xl rotate-12 z-10 hidden md:block border-4 border-white shadow-xl"></div>
            <div className="absolute -left-12 top-12 w-20 h-20 bg-blue-400 rounded-full z-10 hidden md:block border-4 border-white shadow-xl flex items-center justify-center">
              <Icon icon="heroicons:check" className="text-4xl text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* --- WAVE TRANSITION (Dalga Geçişi) --- */}
      <div className="relative -mt-24 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto text-white fill-current"
        >
          <path
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* --- FEATURE CARDS (Kartlar) --- */}
      <section className="bg-white pb-24 px-6 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
              Özellikler
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              İşinizi Kendi Tarzınızla Yönetin
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Aura Plan, size ihtiyacınız olan esnekliği sağlar. İster bireysel
              ister takım halinde, kontrol sizde.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon icon="heroicons:squares-plus" className="text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Özelleştirilebilir Panolar
              </h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                Kanban, Liste veya Takvim görünümü. Projenizin ihtiyacına göre
                görünümü değiştirin.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon icon="heroicons:user-group" className="text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Takım İşbirliği
              </h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                Gerçek zamanlı yorumlar, dosya paylaşımları ve @bahsetmeler ile
                iletişimi güçlendirin.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon icon="heroicons:bolt" className="text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Hepsi Bir Arada Platform
              </h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                Görev yönetimi ve öğrenme modülleri tek çatıda. Başka uygulamaya
                ihtiyacınız yok.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- DETAILED FEATURES (Zikzak Yerleşim) --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Feature Row 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                <Icon icon="heroicons:chart-pie" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Veriye Dayalı Kararlar Alın
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Takımınızın performansını anlık grafiklerle izleyin. Hangi
                görevlerin daha fazla zaman aldığını görün ve süreçlerinizi
                optimize edin.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700">
                  <Icon
                    icon="heroicons:check-circle"
                    className="text-green-500 text-xl"
                  />
                  Otomatik haftalık raporlar
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Icon
                    icon="heroicons:check-circle"
                    className="text-green-500 text-xl"
                  />
                  Kişisel verimlilik puanı
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Placeholder for Analytics Chart UI */}
              <div className="bg-slate-50 rounded h-64 w-full flex items-center justify-center border border-slate-100 border-dashed">
                <div className="text-center">
                  <Icon
                    icon="heroicons:presentation-chart-line"
                    className="text-4xl text-slate-300 mx-auto mb-2"
                  />
                  <span className="text-slate-400 font-medium">
                    Analitik Arayüzü
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Row 2 (Reversed) */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Placeholder for Learning UI */}
              <div className="bg-slate-50 rounded h-64 w-full flex items-center justify-center border border-slate-100 border-dashed">
                <div className="text-center">
                  <Icon
                    icon="heroicons:book-open"
                    className="text-4xl text-slate-300 mx-auto mb-2"
                  />
                  <span className="text-slate-400 font-medium">
                    Öğrenme Kartları
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-amber-500 shadow-sm">
                <Icon icon="heroicons:sparkles" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Sürekli Gelişim Kültürü
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                İş akışını bölmeden, 5 dakikalık mikro öğrenme kartlarıyla
                ekibinizin yetkinliklerini taze tutun.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700">
                  <Icon
                    icon="heroicons:check-circle"
                    className="text-green-500 text-xl"
                  />
                  Kişiselleştirilmiş içerik akışı
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Icon
                    icon="heroicons:check-circle"
                    className="text-green-500 text-xl"
                  />
                  Rozet ve başarı sistemi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF (Logolar) --- */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            Dünya genelinde 2.000+ takım tarafından seviliyor
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Icon icon="logos:spotify" />
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Icon icon="logos:slack" />
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Icon icon="logos:netflix" />
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Icon icon="logos:airbnb" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 bg-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Çalışma şeklinizi değiştirmeye hazır mısınız?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            14 günlük ücretsiz deneme ile Aura Plan'ın tüm özelliklerini
            keşfedin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Ücretsiz Başlayın
            </Link>
            <button className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              Satış Ekibiyle Konuşun
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
