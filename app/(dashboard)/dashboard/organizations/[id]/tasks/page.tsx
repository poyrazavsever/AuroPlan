import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TasksPageClient from "./TasksPageClient";
import { getOrganizationTasks, getOrganizationMembers } from "./actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationTasksPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth kontrolü
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Organizasyonu getir
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, slug, type, status, start_date, end_date")
    .eq("id", id)
    .single();

  if (orgError || !organization) {
    redirect("/dashboard/organizations");
  }

  // Görevleri getir
  const { tasks, stats, error: tasksError } = await getOrganizationTasks(id);

  // Üyeleri getir (atama için)
  const { members } = await getOrganizationMembers(id);

  return (
    <TasksPageClient
      organization={organization}
      initialTasks={tasks}
      initialStats={stats}
      members={members}
    />
  );
}
