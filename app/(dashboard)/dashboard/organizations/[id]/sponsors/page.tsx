import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getOrganizationById } from "../../actions";
import {
  getOrganizationSponsors,
  getSponsorPackages,
  getSponsorStats,
} from "./actions";
import SponsorsPageClient from "./SponsorsPageClient";

export default async function SponsorsPage({
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
  const { organization, error: orgError } = await getOrganizationById(id);

  if (orgError || !organization) {
    notFound();
  }

  // Yetki kontrolü
  const isOwner = organization.created_by === user.id;
  const myMemberRecord = organization.organization_members?.find(
    (m: any) => m.user_id === user.id
  );
  const myRole = myMemberRecord?.role;
  const canManage = isOwner || myRole === "owner" || myRole === "organizer";

  // Sponsor verilerini getir
  const [sponsorsResult, packagesResult, statsResult] = await Promise.all([
    getOrganizationSponsors(id),
    getSponsorPackages(id),
    getSponsorStats(id),
  ]);

  // Takım üyelerini getir (assign için)
  let teamMembers: any[] = [];
  if (organization.team_id) {
    const { data: members } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", organization.team_id);

    if (members && members.length > 0) {
      const userIds = members.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
      teamMembers = profiles || [];
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500">
        <Link
          href="/dashboard/organizations"
          className="hover:text-slate-900 transition-colors"
        >
          Organizasyonlar
        </Link>
        <Icon icon="heroicons:chevron-right" className="mx-2 text-xs" />
        <Link
          href={`/dashboard/organizations/${id}`}
          className="hover:text-slate-900 transition-colors truncate max-w-[150px]"
        >
          {organization.name}
        </Link>
        <Icon icon="heroicons:chevron-right" className="mx-2 text-xs" />
        <span className="font-semibold text-slate-900">Sponsorlar</span>
      </nav>

      <SponsorsPageClient
        organizationId={id}
        organizationName={organization.name}
        sponsors={sponsorsResult.sponsors}
        packages={packagesResult.packages}
        stats={statsResult.stats}
        teamMembers={teamMembers}
        canManage={canManage}
      />
    </div>
  );
}
