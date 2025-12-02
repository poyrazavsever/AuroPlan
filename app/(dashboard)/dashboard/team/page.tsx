import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import { removeMember } from "./actions";
import Image from "next/image";
import TeamAchievementsTab from "@/components/team/TeamAchievementsTab";
import { getTeamAchievements } from "@/app/(dashboard)/dashboard/achievements/actions";
import {
  getTeamLeaderboard,
  getTeamsLeaderboard,
} from "@/app/(dashboard)/dashboard/leaderboard/actions";
import TeamRankingWidget from "@/components/dashboard/TeamRankingWidget";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { teamId?: string; tab?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Kullanıcının Takımlarını Getir
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role, teams(*)")
    .eq("user_id", user.id);

  const myTeams =
    memberships?.map((m: any) => ({
      ...m.teams,
      role: m.role, // Kullanıcının o takımdaki rolü
    })) || [];

  // Hiç takımı yoksa oluşturmaya yönlendir
  if (myTeams.length === 0) {
    redirect("/dashboard/teams/create");
  }

  // 2. Aktif Takımı Belirle (URL parametresi veya ilk takım)
  // Not: Next.js 15+ searchParams'ı promise olarak bekleyebilir, await ekliyoruz.
  const params = await searchParams;
  const activeTeamId = params?.teamId || myTeams[0].id;
  const activeTeam = myTeams.find((t) => t.id === activeTeamId) || myTeams[0];
  const activeTab = params?.tab || "members";

  // 3. Aktif Takımın Üyelerini Getir
  // İlişkisel sorgu: team_members -> profiles
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select(
      "id, role, joined_at, profiles(id, full_name, email, avatar_url, total_xp)"
    )
    .eq("team_id", activeTeam.id)
    .order("joined_at", { ascending: true });

  // 4. Takım Başarımlarını Getir
  const { achievements: teamAchievements } = await getTeamAchievements(
    activeTeam.id
  );

  // 5. Takım Leaderboard ve Takımlar Sıralaması
  const [teamLeaderboard, teamsRanking] = await Promise.all([
    getTeamLeaderboard(activeTeam.id),
    getTeamsLeaderboard(20),
  ]);

  const isOwnerOrAdmin = ["owner", "admin"].includes(activeTeam.role);

  return (
    <div className="py-8">
      {/* --- Header: Takım Bilgisi --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
              {activeTeam.name.substring(0, 2).toUpperCase()}
            </div>
            {activeTeam.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-10">
            {teamMembers?.length || 0} Üye •{" "}
            {activeTeam.role === "owner" ? "Takım Sahibisiniz" : "Üyesiniz"}
          </p>
        </div>
      </div>

      {/* --- Sekmeler --- */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <a
          href={`/dashboard/team?teamId=${activeTeam.id}&tab=members`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "members"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon icon="heroicons:users" />
            Üyeler
          </span>
        </a>
        <a
          href={`/dashboard/team?teamId=${activeTeam.id}&tab=achievements`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "achievements"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon icon="heroicons:trophy" />
            Başarımlar
            {teamAchievements.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded">
                {teamAchievements.length}
              </span>
            )}
          </span>
        </a>
        <a
          href={`/dashboard/team?teamId=${activeTeam.id}&tab=competition`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "competition"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon icon="heroicons:chart-bar" />
            Rekabet
          </span>
        </a>
      </div>

      {/* --- Üyeler Sekmesi --- */}
      {activeTab === "members" && (
        <>
          {/* --- Davet Formu (Sadece Yöneticiler) --- */}
          {isOwnerOrAdmin && <InviteMemberForm teamId={activeTeam.id} />}

          {/* --- Üye Listesi --- */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <th className="px-6 py-4">Üye</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Puan (XP)</th>
                  <th className="px-6 py-4">Katılım Tarihi</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers?.map((member: any) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100">
                          {member.profiles.avatar_url ? (
                            <Image
                              src={member.profiles.avatar_url}
                              alt="avatar"
                              width={36}
                              height={36}
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              {member.profiles.full_name?.[0] ||
                                member.profiles.email[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {member.profiles.full_name || "İsimsiz Kullanıcı"}
                            {member.profiles.id === user.id && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                Siz
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {member.profiles.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          member.role === "owner"
                            ? "bg-amber-100 text-amber-800"
                            : member.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {member.role === "owner"
                          ? "Sahip"
                          : member.role === "admin"
                          ? "Yönetici"
                          : "Üye"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                        <Icon
                          icon="heroicons:bolt"
                          className="text-amber-500"
                        />
                        {member.profiles.total_xp || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(member.joined_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Sadece yöneticiler, kendileri hariç diğerlerini çıkarabilir */}
                      {isOwnerOrAdmin &&
                        member.profiles.id !== user.id &&
                        member.role !== "owner" && (
                          <form action={removeMember}>
                            <input
                              type="hidden"
                              name="memberId"
                              value={member.id}
                            />
                            <button
                              type="submit"
                              className="text-slate-400 hover:text-red-600 transition-colors p-2"
                              title="Takımdan Çıkar"
                            >
                              <Icon
                                icon="heroicons:trash"
                                className="text-lg"
                              />
                            </button>
                          </form>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- Başarımlar Sekmesi --- */}
      {activeTab === "achievements" && (
        <TeamAchievementsTab
          teamId={activeTeam.id}
          achievements={teamAchievements as any}
          isOwnerOrAdmin={isOwnerOrAdmin}
        />
      )}

      {/* --- Rekabet Sekmesi --- */}
      {activeTab === "competition" && (
        <div className="space-y-6">
          {/* Takım İçi Sıralama */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="heroicons:users" className="text-blue-500" />
                Takım İçi Sıralama
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {activeTeam.name} takımındaki üyelerin XP sıralaması
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {teamLeaderboard.members
                .slice(0, 10)
                .map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className={`p-4 flex items-center gap-4 ${
                      member.id === user?.id
                        ? "bg-blue-50/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Sıra */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-600"
                          : index === 1
                          ? "bg-slate-100 text-slate-500"
                          : index === 2
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.full_name || "Avatar"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.full_name?.charAt(0) ||
                        member.email?.charAt(0) ||
                        "?"
                      )}
                    </div>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">
                          {member.full_name || "İsimsiz"}
                        </span>
                        {member.id === user?.id && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            SEN
                          </span>
                        )}
                        {member.role === "owner" && (
                          <Icon
                            icon="heroicons:star-solid"
                            className="text-amber-400 text-sm"
                          />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Level {member.level || 1}
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {(member.total_xp || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">XP</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Takımlar Arası Sıralama */}
          <TeamRankingWidget
            teams={teamsRanking.teams}
            userTeamIds={myTeams.map((t: any) => t.id)}
            title="Takımlar Arası Sıralama"
          />

          {/* Takım İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon
                    icon="heroicons:bolt"
                    className="text-xl text-amber-500"
                  />
                </div>
                <span className="text-sm text-slate-500">Toplam XP</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {teamLeaderboard.members
                  .reduce((sum: number, m: any) => sum + (m.total_xp || 0), 0)
                  .toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon
                    icon="heroicons:chart-bar"
                    className="text-xl text-blue-500"
                  />
                </div>
                <span className="text-sm text-slate-500">Ortalama XP</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {teamLeaderboard.members.length > 0
                  ? Math.round(
                      teamLeaderboard.members.reduce(
                        (sum: number, m: any) => sum + (m.total_xp || 0),
                        0
                      ) / teamLeaderboard.members.length
                    ).toLocaleString()
                  : 0}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon
                    icon="heroicons:trophy"
                    className="text-xl text-purple-500"
                  />
                </div>
                <span className="text-sm text-slate-500">Global Sıra</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                #
                {teamsRanking.teams.find((t: any) => t.id === activeTeam.id)
                  ?.rank || "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
