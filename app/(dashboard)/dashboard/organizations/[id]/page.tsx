import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getOrganizationById, getAvailableTeamMembers } from "../actions";
import OrganizationHeader from "@/components/organizations/OrganizationHeader";
import OrganizationMilestonesList from "@/components/organizations/OrganizationMilestonesList";
import OrganizationMembersList from "@/components/organizations/OrganizationMembersList";
import NewOrganizationMilestoneModal from "@/components/organizations/NewOrganizationMilestoneModal";
import AddOrganizationMemberModal from "@/components/organizations/AddOrganizationMemberModal";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;

  // Organizasyon detaylarını getir
  const { organization, error } = await getOrganizationById(id);

  if (error || !organization) {
    notFound();
  }

  // Yetki kontrolü
  const isOwner = organization.created_by === user.id;
  const myMemberRecord = organization.organization_members?.find(
    (m: any) => m.user_id === user.id
  );
  const myRole = myMemberRecord?.role;
  const canManage = isOwner || myRole === "owner" || myRole === "organizer";
  const canEdit = canManage || myRole === "coordinator";

  // Müsait takım üyelerini getir (eğer takım varsa)
  let availableMembers: any[] = [];
  if (organization.team_id) {
    const { availableMembers: members } = await getAvailableTeamMembers(
      id,
      organization.team_id
    );
    availableMembers = members;
  }

  // Milestone'ları sırala
  const milestones = (organization.organization_milestones || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  // İlerleme hesabı
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "completed"
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  // Üyeler
  const members = organization.organization_members || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500 mb-4">
        <Link
          href="/dashboard/organizations"
          className="hover:text-slate-900 transition-colors"
        >
          Organizasyonlar
        </Link>
        <Icon icon="heroicons:chevron-right" className="mx-2 text-xs" />
        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
          {organization.name}
        </span>
      </nav>

      {/* Header */}
      <OrganizationHeader
        organization={organization}
        progress={progress}
        canManage={canManage}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon (Ana İçerik) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Yol Haritası (Milestones) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="heroicons:flag" className="text-blue-500" />
                Yol Haritası
              </h3>
              {canEdit && (
                <NewOrganizationMilestoneModal
                  organizationId={organization.id}
                />
              )}
            </div>
            <div className="p-6">
              <OrganizationMilestonesList
                milestones={milestones}
                organizationId={organization.id}
                canEdit={canEdit}
              />
            </div>
          </div>

          {/* Açıklama */}
          {organization.description && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Icon
                  icon="heroicons:document-text"
                  className="text-amber-500"
                />
                Açıklama
              </h3>
              <p className="text-slate-600 whitespace-pre-wrap">
                {organization.description}
              </p>
            </div>
          )}

          {/* Konum Bilgileri */}
          {(organization.location_name ||
            organization.location_address ||
            organization.location_url) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Icon icon="heroicons:map-pin" className="text-red-500" />
                Konum Bilgileri
              </h3>
              <div className="space-y-3">
                {organization.location_name && (
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="heroicons:building-office-2"
                      className="text-slate-400 mt-0.5"
                    />
                    <span className="text-slate-700">
                      {organization.location_name}
                    </span>
                  </div>
                )}
                {organization.location_address && (
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="heroicons:map"
                      className="text-slate-400 mt-0.5"
                    />
                    <span className="text-slate-600">
                      {organization.location_address}
                    </span>
                  </div>
                )}
                {organization.location_url && (
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="heroicons:link"
                      className="text-slate-400 mt-0.5"
                    />
                    <a
                      href={organization.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {organization.location_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Kolon (Yan Bilgiler) */}
        <div className="space-y-8">
          {/* Ekip */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Icon icon="heroicons:users" className="text-purple-500" />
                Organizasyon Ekibi
              </h3>
              {canManage && organization.team_id && (
                <AddOrganizationMemberModal
                  organizationId={organization.id}
                  availableMembers={availableMembers}
                />
              )}
            </div>
            <OrganizationMembersList
              members={members}
              organizationId={organization.id}
              canManage={canManage}
              currentUserId={user.id}
            />
          </div>

          {/* İstatistikler */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
              <Icon icon="heroicons:chart-bar" className="text-green-500" />
              İstatistikler
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Toplam Üye</span>
                <span className="font-bold text-slate-900">
                  {members.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Milestone</span>
                <span className="font-bold text-slate-900">
                  {completedMilestones}/{milestones.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">İlerleme</span>
                <span className="font-bold text-slate-900">{progress}%</span>
              </div>
              {organization.total_sponsors > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Sponsor</span>
                  <span className="font-bold text-slate-900">
                    {organization.total_sponsors}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
              <Icon icon="heroicons:bolt" className="text-amber-500" />
              Hızlı Erişim
            </h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/organizations/${organization.id}/tasks`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Icon
                  icon="heroicons:clipboard-document-list"
                  className="text-green-500"
                />
                <span className="text-sm font-medium">Görevler</span>
                <Icon
                  icon="heroicons:chevron-right"
                  className="ml-auto text-slate-400"
                />
              </Link>
              <Link
                href={`/dashboard/organizations/${organization.id}/sponsors`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Icon
                  icon="heroicons:building-office"
                  className="text-blue-500"
                />
                <span className="text-sm font-medium">Sponsorlar</span>
                <Icon
                  icon="heroicons:chevron-right"
                  className="ml-auto text-slate-400"
                />
              </Link>
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed"
              >
                <Icon icon="heroicons:document-text" />
                <span className="text-sm">Dokümanlar</span>
                <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded">
                  Yakında
                </span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed"
              >
                <Icon icon="heroicons:banknotes" />
                <span className="text-sm">Bütçe</span>
                <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded">
                  Yakında
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
