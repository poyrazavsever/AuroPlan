import { Icon } from "@iconify/react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hoşgeldin Mesajı */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hoş geldin! 👋</h2>
          <p className="text-slate-500 text-sm mt-1">
            Bugün işlerini tamamlamak için harika bir gün.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <Icon icon="heroicons:plus" />
          Hızlı Görev Ekle
        </button>
      </div>

      {/* İstatistikler (Dummy) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Icon icon="heroicons:list-bullet" className="text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Bu Hafta
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">12</div>
          <div className="text-sm text-slate-500 mt-1">Bekleyen Görev</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-amber-200 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Icon icon="heroicons:clock" className="text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Süren
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">4</div>
          <div className="text-sm text-slate-500 mt-1">Devam Eden İş</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-green-200 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <Icon icon="heroicons:check-circle" className="text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Toplam
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">85%</div>
          <div className="text-sm text-slate-500 mt-1">Tamamlanma Oranı</div>
        </div>
      </div>

      {/* Boş Durum (Empty State) Örneği */}
      <div className="mt-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <Icon
            icon="heroicons:clipboard-document-list"
            className="text-3xl text-slate-300"
          />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Henüz son aktivite yok
        </h3>
        <p className="text-slate-500 max-w-sm mt-2">
          Görevlerinizi tamamladıkça ve öğrenme kartlarını bitirdikçe burada
          aktiviteleriniz görünecek.
        </p>
      </div>
    </div>
  );
}
