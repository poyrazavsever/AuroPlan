"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { onTaskComplete } from "../achievements/actions";
import type { TaskCategory, TaskWithAssignee } from "@/types/supabase";

// Tip tanımları
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface TaskFilters {
  organizationId?: string;
  teamId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assignedTo?: string;
  searchQuery?: string;
}

// Görevleri Getir
export async function getTasks(filters?: TaskFilters): Promise<{
  tasks: TaskWithAssignee[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { tasks: [], error: "Unauthorized" };
  }

  let query = supabase
    .from("tasks")
    .select(
      `
      *,
      profiles:assigned_to(id, full_name, email, avatar_url),
      organizations:organization_id(id, name)
    `
    )
    .order("created_at", { ascending: false });

  // Filtreler
  if (filters?.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }
  if (filters?.teamId) {
    query = query.eq("team_id", filters.teamId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }
  if (filters?.searchQuery) {
    query = query.ilike("title", `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return { tasks: [], error: error.message };
  }

  return { tasks: (data as TaskWithAssignee[]) || [], error: null };
}

// Organizasyon Görevlerini Getir
export async function getOrganizationTasks(
  organizationId: string,
  filters?: Omit<TaskFilters, "organizationId">
): Promise<{
  tasks: TaskWithAssignee[];
  stats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    byCategory: Record<string, number>;
  };
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      tasks: [],
      stats: { total: 0, todo: 0, in_progress: 0, done: 0, byCategory: {} },
      error: "Unauthorized",
    };
  }

  let query = supabase
    .from("tasks")
    .select(
      `
      *,
      profiles:assigned_to(id, full_name, email, avatar_url)
    `
    )
    .eq("organization_id", organizationId)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Filtreler
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }
  if (filters?.searchQuery) {
    query = query.ilike("title", `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching organization tasks:", error);
    return {
      tasks: [],
      stats: { total: 0, todo: 0, in_progress: 0, done: 0, byCategory: {} },
      error: error.message,
    };
  }

  const tasks = (data as TaskWithAssignee[]) || [];

  // İstatistikleri hesapla
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    byCategory: {} as Record<string, number>,
  };

  // Kategori bazlı sayılar
  tasks.forEach((task) => {
    const cat = task.category || "other";
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  });

  return { tasks, stats, error: null };
}

// Görev Oluşturma
export async function createTask(formData: FormData) {
  const supabase = await createClient();

  // Oturum kontrolü
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const category = formData.get("category") as string | null;
  const organizationId = formData.get("organization_id") as string | null;
  const assignedTo = formData.get("assigned_to") as string | null;
  const dueDate = formData.get("due_date") as string | null;
  const status = "todo"; // Varsayılan başlangıç durumu

  if (!title) return { success: false, error: "Title is required" };

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    priority,
    status,
    category: category || null,
    organization_id: organizationId || null,
    assigned_to: assignedTo || null,
    due_date: dueDate || null,
    created_by: user.id,
  });

  if (error) {
    console.error("Task creation failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  if (organizationId) {
    revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  }

  return { success: true, error: null };
}

// Organizasyon için Görev Oluştur
export async function createOrganizationTask(data: {
  organizationId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  assignedTo?: string;
  dueDate?: string;
}): Promise<{ success: boolean; error: string | null; taskId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: data.title,
      description: data.description || null,
      priority: data.priority || "medium",
      category: data.category || null,
      status: "todo",
      organization_id: data.organizationId,
      assigned_to: data.assignedTo || null,
      due_date: data.dueDate || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Organization task creation failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/organizations/${data.organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${data.organizationId}`);

  return { success: true, error: null, taskId: task.id };
}

// Görev Güncelle
export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    category?: TaskCategory | null;
    assignedTo?: string | null;
    dueDate?: string | null;
    status?: TaskStatus;
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Önce görevi al, organizasyonu bulalım revalidate için
  const { data: existingTask } = await supabase
    .from("tasks")
    .select("organization_id")
    .eq("id", taskId)
    .single();

  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.assignedTo !== undefined)
    updateData.assigned_to = updates.assignedTo;
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId);

  if (error) {
    console.error("Task update failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  if (existingTask?.organization_id) {
    revalidatePath(
      `/dashboard/organizations/${existingTask.organization_id}/tasks`
    );
    revalidatePath(`/dashboard/organizations/${existingTask.organization_id}`);
  }

  return { success: true, error: null };
}

// Görev Silme
export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  // Önce görevi al
  const { data: task } = await supabase
    .from("tasks")
    .select("organization_id")
    .eq("id", taskId)
    .single();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) console.error("Delete failed:", error);

  revalidatePath("/dashboard/tasks");
  if (task?.organization_id) {
    revalidatePath(`/dashboard/organizations/${task.organization_id}/tasks`);
  }
}

// Görev Durumu Güncelleme (Sürükle-Bırak için)
export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await createClient();

  // Önce görevin mevcut durumunu ve önceliğini al
  const { data: task } = await supabase
    .from("tasks")
    .select("status, priority, organization_id")
    .eq("id", taskId)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    console.error("Update failed:", error);
    return { success: false, awardedAchievements: [] };
  }

  // Eğer görev "done" durumuna geçtiyse, başarım kontrolü yap
  let awardedAchievements: unknown[] = [];
  if (newStatus === "done" && task?.status !== "done") {
    try {
      awardedAchievements = await onTaskComplete(task?.priority);
    } catch (err) {
      console.error("Achievement check failed:", err);
    }
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/achievements");
  if (task?.organization_id) {
    revalidatePath(`/dashboard/organizations/${task.organization_id}/tasks`);
  }

  return { success: true, awardedAchievements };
}

// Toplu Görev Oluştur (Şablondan)
export async function createTasksFromTemplate(
  organizationId: string,
  templateId: string,
  eventDate: Date
): Promise<{ success: boolean; error: string | null; createdCount: number }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized", createdCount: 0 };
  }

  // Şablonu getir
  const { data: template, error: templateError } = await supabase
    .from("task_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    return { success: false, error: "Template not found", createdCount: 0 };
  }

  // Şablondaki görevleri parse et
  const templateTasks = template.tasks as Array<{
    title: string;
    description: string;
    category: TaskCategory;
    relative_days: number;
    priority: TaskPriority;
  }>;

  // Görevleri oluştur
  const tasksToInsert = templateTasks.map((t) => {
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() + t.relative_days);

    return {
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: "todo" as const,
      organization_id: organizationId,
      due_date: dueDate.toISOString(),
      created_by: user.id,
    };
  });

  const { error: insertError } = await supabase
    .from("tasks")
    .insert(tasksToInsert);

  if (insertError) {
    console.error("Failed to create tasks from template:", insertError);
    return { success: false, error: insertError.message, createdCount: 0 };
  }

  // Kullanım sayısını artır
  await supabase
    .from("task_templates")
    .update({ use_count: (template.use_count || 0) + 1 })
    .eq("id", templateId);

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${organizationId}`);

  return { success: true, error: null, createdCount: tasksToInsert.length };
}

// Görev Şablonlarını Getir
export async function getTaskTemplates(organizationType?: string): Promise<{
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    organization_type: string | null;
    tasks: unknown;
    is_public: boolean;
    use_count: number;
  }>;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { templates: [], error: "Unauthorized" };
  }

  let query = supabase
    .from("task_templates")
    .select("*")
    .or(`is_public.eq.true,created_by.eq.${user.id}`)
    .order("use_count", { ascending: false });

  if (organizationType) {
    query = query.or(
      `organization_type.eq.${organizationType},organization_type.is.null`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching templates:", error);
    return { templates: [], error: error.message };
  }

  return { templates: data || [], error: null };
}

// Görev Ata
export async function assignTask(
  taskId: string,
  userId: string | null
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("organization_id")
    .eq("id", taskId)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: userId })
    .eq("id", taskId);

  if (error) {
    console.error("Task assignment failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  if (task?.organization_id) {
    revalidatePath(`/dashboard/organizations/${task.organization_id}/tasks`);
  }

  return { success: true, error: null };
}
