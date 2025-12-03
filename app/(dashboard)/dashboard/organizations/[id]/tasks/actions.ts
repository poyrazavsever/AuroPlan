"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskCategory, TaskWithAssignee } from "@/types/supabase";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assignedTo?: string;
  searchQuery?: string;
}

// Organizasyon Görevlerini Getir
export async function getOrganizationTasks(
  organizationId: string,
  filters?: TaskFilters
): Promise<{
  tasks: TaskWithAssignee[];
  stats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    byCategory: Record<string, number>;
    overdue: number;
    dueToday: number;
    dueSoon: number;
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
      stats: {
        total: 0,
        todo: 0,
        in_progress: 0,
        done: 0,
        byCategory: {},
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
      },
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
      stats: {
        total: 0,
        todo: 0,
        in_progress: 0,
        done: 0,
        byCategory: {},
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
      },
      error: error.message,
    };
  }

  const tasks = (data as TaskWithAssignee[]) || [];

  // Tarih hesaplamaları
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // İstatistikleri hesapla
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    byCategory: {} as Record<string, number>,
    overdue: 0,
    dueToday: 0,
    dueSoon: 0,
  };

  // Kategori bazlı ve tarih bazlı sayılar
  tasks.forEach((task) => {
    const cat = task.category || "other";
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

    if (task.due_date && task.status !== "done") {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        stats.overdue++;
      } else if (dueDate.getTime() === today.getTime()) {
        stats.dueToday++;
      } else if (dueDate < nextWeek) {
        stats.dueSoon++;
      }
    }
  });

  return { tasks, stats, error: null };
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

  revalidatePath(`/dashboard/organizations/${data.organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${data.organizationId}`);

  return { success: true, error: null, taskId: task.id };
}

// Görev Güncelle
export async function updateOrganizationTask(
  taskId: string,
  organizationId: string,
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

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${organizationId}`);

  return { success: true, error: null };
}

// Görev Durumu Güncelle
export async function updateOrganizationTaskStatus(
  taskId: string,
  organizationId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    console.error("Task status update failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${organizationId}`);

  return { success: true, error: null };
}

// Görev Sil
export async function deleteOrganizationTask(
  taskId: string,
  organizationId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Task deletion failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${organizationId}`);

  return { success: true, error: null };
}

// Organizasyon Üyelerini Getir (Atama için)
export async function getOrganizationMembers(organizationId: string): Promise<{
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  }>;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      id,
      user_id,
      role,
      profiles:user_id(id, full_name, email, avatar_url)
    `
    )
    .eq("organization_id", organizationId)
    .order("role");

  if (error) {
    console.error("Error fetching organization members:", error);
    return { members: [], error: error.message };
  }

  return { members: (data as any) || [], error: null };
}

// Görev Ata
export async function assignOrganizationTask(
  taskId: string,
  organizationId: string,
  userId: string | null
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: userId })
    .eq("id", taskId);

  if (error) {
    console.error("Task assignment failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);

  return { success: true, error: null };
}

// Toplu Görev Durumu Güncelle
export async function bulkUpdateTaskStatus(
  taskIds: string[],
  organizationId: string,
  newStatus: TaskStatus
): Promise<{ success: boolean; error: string | null; updatedCount: number }> {
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .in("id", taskIds);

  if (error) {
    console.error("Bulk task status update failed:", error);
    return { success: false, error: error.message, updatedCount: 0 };
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/tasks`);
  revalidatePath(`/dashboard/organizations/${organizationId}`);

  return { success: true, error: null, updatedCount: count || taskIds.length };
}
