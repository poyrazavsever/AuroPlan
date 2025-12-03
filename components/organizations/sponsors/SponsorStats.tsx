"use client";

import { Icon } from "@iconify/react";

type Stats = {
  total: number;
  potential: number;
  contacted: number;
  negotiating: number;
  proposalSent: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  approvedAmount: number;
};

type SponsorStatsProps = {
  stats: Stats;
};

export default function SponsorStats({ stats }: SponsorStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const conversionRate =
    stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : "0";

  const statItems = [
    {
      label: "Toplam Sponsor",
      value: stats.total,
      icon: "heroicons:building-office-2",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Onaylanan",
      value: stats.approved,
      icon: "heroicons:check-badge",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Görüşmede",
      value: stats.negotiating + stats.proposalSent,
      icon: "heroicons:chat-bubble-left-right",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Dönüşüm Oranı",
      value: `%${conversionRate}`,
      icon: "heroicons:arrow-trending-up",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${item.color}`}>
              <Icon icon={item.icon} className="text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Bütçe Kartları */}
      <div className="col-span-2 lg:col-span-2 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Onaylanan Tutar</p>
            <p className="text-3xl font-bold">
              {formatCurrency(stats.approvedAmount)}
            </p>
          </div>
          <Icon
            icon="heroicons:banknotes"
            className="text-4xl text-green-200"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-green-400/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-100">Potansiyel Toplam</span>
            <span className="font-semibold">
              {formatCurrency(stats.totalAmount)}
            </span>
          </div>
          {stats.totalAmount > 0 && (
            <div className="mt-2">
              <div className="h-2 bg-green-400/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (stats.approvedAmount / stats.totalAmount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Özeti */}
      <div className="col-span-2 lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Icon icon="heroicons:funnel" className="text-slate-400" />
          Pipeline Özeti
        </h3>
        <div className="space-y-3">
          <PipelineRow
            label="Potansiyel"
            count={stats.potential}
            color="bg-slate-200"
            total={stats.total}
          />
          <PipelineRow
            label="İletişimde"
            count={stats.contacted}
            color="bg-blue-400"
            total={stats.total}
          />
          <PipelineRow
            label="Görüşmede"
            count={stats.negotiating}
            color="bg-amber-400"
            total={stats.total}
          />
          <PipelineRow
            label="Teklif Gönderildi"
            count={stats.proposalSent}
            color="bg-purple-400"
            total={stats.total}
          />
          <PipelineRow
            label="Onaylandı"
            count={stats.approved}
            color="bg-green-400"
            total={stats.total}
          />
        </div>
      </div>
    </div>
  );
}

function PipelineRow({
  label,
  count,
  color,
  total,
}: {
  label: string;
  count: number;
  color: string;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-32">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-900 w-8 text-right">
        {count}
      </span>
    </div>
  );
}
