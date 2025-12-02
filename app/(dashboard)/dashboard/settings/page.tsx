import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsPageClient from "./SettingsPageClient";
import { getUserSettings } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const activeTab = params?.tab || "account";

  // Profil bilgilerini al
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Ayarları al
  const settings = await getUserSettings();

  return (
    <SettingsPageClient
      user={user}
      profile={profile}
      settings={settings}
      activeTab={activeTab}
    />
  );
}
