import Link from "next/link";
import { Icon } from "@iconify/react";
import CreateTeamForm from "@/components/team/CreateTeamForm";

export default function CreateTeamPage() {
  return (
    <div className="py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <Icon icon="heroicons:arrow-left" />
          Dashboard'a Dön
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Yeni Takım Kur
        </h1>
        <p className="text-slate-500">
          Projelerinizi ve ekibinizi yönetmek için yeni bir çalışma alanı
          oluşturun.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <CreateTeamForm />
      </div>
    </div>
  );
}
