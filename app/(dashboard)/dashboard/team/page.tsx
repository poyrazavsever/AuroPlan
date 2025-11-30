import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import { removeMember } from "./actions";
import Image from "next/image";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { teamId?: string };
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

  // 3. Aktif Takımın Üyelerini Getir
  // İlişkisel sorgu: team_members -> profiles
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select(
      "id, role, joined_at, profiles(id, full_name, email, avatar_url, total_xp)"
    )
    .eq("team_id", activeTeam.id)
    .order("joined_at", { ascending: true });

  const isOwnerOrAdmin = ["owner", "admin"].includes(activeTeam.role);

  return (
    <div className="py-8">
      {/* --- Header: Takım Seçimi ve Bilgisi --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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

        {/* Takım Değiştirici (Basit Link Listesi) */}
        {myTeams.length > 1 && (
          <div className="flex gap-2">
            {myTeams.map((team) => (
              <a
                key={team.id}
                href={`/dashboard/team?teamId=${team.id}`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors
                  ${
                    team.id === activeTeam.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
              >
                {team.name}
              </a>
            ))}
          </div>
        )}
      </div>

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
                    <Icon icon="heroicons:bolt" className="text-amber-500" />
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
                          <Icon icon="heroicons:trash" className="text-lg" />
                        </button>
                      </form>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
