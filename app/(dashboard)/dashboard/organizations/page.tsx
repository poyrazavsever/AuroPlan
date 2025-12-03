import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OrganizationsPageClient from "./OrganizationsPageClient";
import { getOrganizations, getUserTeams } from "./actions";

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Organizasyonları ve takımları getir
  const [{ organizations }, { teams }] = await Promise.all([
    getOrganizations(),
    getUserTeams(),
  ]);

  return (
    <OrganizationsPageClient
      organizations={organizations}
      teams={teams as any}
      user={user}
    />
  );
}
