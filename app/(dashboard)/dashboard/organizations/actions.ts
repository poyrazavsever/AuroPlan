"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// ORGANİZASYON CRUD İŞLEMLERİ
// ============================================

// Slug oluşturma yardımcı fonksiyonu
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

// --- TÜM ORGANİZASYONLARI GETİR ---
export async function getOrganizations(teamId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { organizations: [], error: "Oturum bulunamadı" };

  let query = supabase
    .from("organizations")
    .select(
      `
      *,
      teams ( name, slug ),
      projects ( name, slug ),
      organization_members ( id, role, user_id )
    `
    )
    .order("created_at", { ascending: false });

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Organizasyonlar getirilemedi:", error);
    return { organizations: [], error: error.message };
  }

  return { organizations: data || [], error: null };
}

// --- TEK ORGANİZASYON GETİR ---
export async function getOrganizationById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { organization: null, error: "Oturum bulunamadı" };

  // Ana organizasyon verisini çek
  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .select(
      `
      *,
      teams ( id, name, slug ),
      projects ( id, name, slug ),
      organization_milestones ( 
        id, title, description, due_date, status, order_index, progress, color, icon, created_at 
      )
    `
    )
    .eq("id", id)
    .single();

  if (orgError) {
    console.error("Organizasyon getirilemedi:", orgError);
    return { organization: null, error: orgError.message };
  }

  // Üyeleri ayrı çek
  const { data: membersData } = await supabase
    .from("organization_members")
    .select("id, role, department, user_id, joined_at")
    .eq("organization_id", id);

  // Üyelerin profil bilgilerini çek
  const memberUserIds = membersData?.map((m) => m.user_id) || [];
  let profilesMap: Record<string, any> = {};

  if (memberUserIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", memberUserIds);

    profilesMap = (profilesData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);
  }

  // Üyelere profil bilgilerini ekle
  const membersWithProfiles = (membersData || []).map((member) => ({
    ...member,
    profiles: profilesMap[member.user_id] || null,
  }));

  const organization = {
    ...orgData,
    organization_members: membersWithProfiles,
  };

  return { organization, error: null };
}

// --- ORGANİZASYON OLUŞTUR ---
export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const scope = formData.get("scope") as string;
  const teamId = formData.get("team_id") as string;
  const projectId = formData.get("project_id") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const locationType = formData.get("location_type") as string;
  const locationName = formData.get("location_name") as string;
  const locationAddress = formData.get("location_address") as string;
  const locationUrl = formData.get("location_url") as string;
  const visibility = formData.get("visibility") as string;
  const colorTheme = formData.get("color_theme") as string;

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      description: description || null,
      type,
      scope: scope || "team",
      team_id: teamId || null,
      project_id: projectId || null,
      created_by: user.id,
      start_date: startDate || null,
      end_date: endDate || null,
      location_type: locationType || "physical",
      location_name: locationName || null,
      location_address: locationAddress || null,
      location_url: locationUrl || null,
      visibility: visibility || "private",
      color_theme: colorTheme || "#3B82F6",
    })
    .select()
    .single();

  if (error) {
    console.error("Organizasyon oluşturulamadı:", error);
    throw new Error("Organizasyon oluşturulamadı");
  }

  // Oluşturan kişiyi owner olarak ekle
  await supabase.from("organization_members").insert({
    organization_id: data.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/dashboard/organizations");
  return { success: true, organizationId: data.id };
}

// --- ORGANİZASYON GÜNCELLE ---
export async function updateOrganization(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const updateData: Record<string, any> = {};

  const fields = [
    "name",
    "description",
    "type",
    "start_date",
    "end_date",
    "location_type",
    "location_name",
    "location_address",
    "location_url",
    "visibility",
    "color_theme",
    "status",
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null && value !== "") {
      updateData[field] = value;
    }
  });

  const { error } = await supabase
    .from("organizations")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Organizasyon güncellenemedi:", error);
    throw new Error("Organizasyon güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${id}`);
  revalidatePath("/dashboard/organizations");
  return { success: true };
}

// --- ORGANİZASYON DURUMU GÜNCELLE ---
export async function updateOrganizationStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const { error } = await supabase
    .from("organizations")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Durum güncellenemedi:", error);
    throw new Error("Durum güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${id}`);
  revalidatePath("/dashboard/organizations");
  return { success: true };
}

// --- ORGANİZASYON SİL ---
export async function deleteOrganization(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error) {
    console.error("Organizasyon silinemedi:", error);
    throw new Error("Organizasyon silinemedi");
  }

  revalidatePath("/dashboard/organizations");
  return { success: true };
}

// ============================================
// MİLESTONE (YOL HARİTASI) İŞLEMLERİ
// ============================================

// --- MİLESTONE'LARI GETİR ---
export async function getOrganizationMilestones(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_milestones")
    .select("*")
    .eq("organization_id", organizationId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Milestone'lar getirilemedi:", error);
    return { milestones: [], error: error.message };
  }

  return { milestones: data || [], error: null };
}

// --- MİLESTONE OLUŞTUR ---
export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const organizationId = formData.get("organization_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;

  // Son sıra numarasını bul
  const { data: lastMilestone } = await supabase
    .from("organization_milestones")
    .select("order_index")
    .eq("organization_id", organizationId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (lastMilestone?.order_index ?? -1) + 1;

  const { error } = await supabase.from("organization_milestones").insert({
    organization_id: organizationId,
    title,
    description: description || null,
    due_date: dueDate || null,
    color: color || null,
    icon: icon || null,
    order_index: orderIndex,
    created_by: user.id,
  });

  if (error) {
    console.error("Milestone oluşturulamadı:", error);
    throw new Error("Milestone oluşturulamadı");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- MİLESTONE GÜNCELLE ---
export async function updateMilestone(id: string, formData: FormData) {
  const supabase = await createClient();

  const organizationId = formData.get("organization_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const status = formData.get("status") as string;
  const progress = formData.get("progress") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;

  const updateData: Record<string, any> = {};

  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (dueDate !== undefined) updateData.due_date = dueDate || null;
  if (status) updateData.status = status;
  if (progress) updateData.progress = parseInt(progress);
  if (color !== undefined) updateData.color = color || null;
  if (icon !== undefined) updateData.icon = icon || null;

  const { error } = await supabase
    .from("organization_milestones")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Milestone güncellenemedi:", error);
    throw new Error("Milestone güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- MİLESTONE DURUMU GÜNCELLE ---
export async function updateMilestoneStatus(
  id: string,
  status: string,
  organizationId: string
) {
  const supabase = await createClient();

  // Durum "completed" ise progress'i 100 yap
  const updateData: Record<string, any> = { status };
  if (status === "completed") {
    updateData.progress = 100;
  }

  const { error } = await supabase
    .from("organization_milestones")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Milestone durumu güncellenemedi:", error);
    throw new Error("Milestone durumu güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- MİLESTONE SİL ---
export async function deleteMilestone(id: string, organizationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_milestones")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Milestone silinemedi:", error);
    throw new Error("Milestone silinemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- MİLESTONE SIRALA ---
export async function reorderMilestones(
  milestones: { id: string; order_index: number }[],
  organizationId: string
) {
  const supabase = await createClient();

  // Her milestone için güncelleme yap
  const updates = milestones.map((m) =>
    supabase
      .from("organization_milestones")
      .update({ order_index: m.order_index })
      .eq("id", m.id)
  );

  await Promise.all(updates);

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// ============================================
// ÜYE YÖNETİMİ İŞLEMLERİ
// ============================================

// --- ÜYELERİ GETİR ---
export async function getOrganizationMembers(organizationId: string) {
  const supabase = await createClient();

  // Üyeleri çek
  const { data: membersData, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Üyeler getirilemedi:", error);
    return { members: [], error: error.message };
  }

  // Profil bilgilerini ayrı çek
  const userIds = membersData?.map((m) => m.user_id) || [];
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    profilesMap = (profilesData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);
  }

  // Üyelere profil bilgilerini ekle
  const membersWithProfiles = (membersData || []).map((member) => ({
    ...member,
    profiles: profilesMap[member.user_id] || null,
  }));

  return { members: membersWithProfiles, error: null };
}

// --- ÜYE EKLE ---
export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: string = "member",
  department?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: userId,
    role,
    department: department || null,
  });

  if (error) {
    console.error("Üye eklenemedi:", error);
    throw new Error("Üye eklenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- ÜYE ROLÜNÜ GÜNCELLE ---
export async function updateMemberRole(
  memberId: string,
  role: string,
  organizationId: string,
  department?: string
) {
  const supabase = await createClient();

  const updateData: Record<string, any> = { role };
  if (department !== undefined) {
    updateData.department = department || null;
  }

  const { error } = await supabase
    .from("organization_members")
    .update(updateData)
    .eq("id", memberId);

  if (error) {
    console.error("Üye rolü güncellenemedi:", error);
    throw new Error("Üye rolü güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- ÜYE ÇIKAR ---
export async function removeOrganizationMember(
  memberId: string,
  organizationId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("Üye çıkarılamadı:", error);
    throw new Error("Üye çıkarılamadı");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}`);
  return { success: true };
}

// --- MÜSAİT TAKIM ÜYELERİNİ GETİR (Organizasyona eklenmemiş olanlar) ---
export async function getAvailableTeamMembers(
  organizationId: string,
  teamId: string
) {
  const supabase = await createClient();

  // Organizasyona zaten eklenmiş kullanıcıları bul
  const { data: existingMembers } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organizationId);

  const existingUserIds = new Set(existingMembers?.map((m) => m.user_id) || []);

  // Takımdaki tüm üyeleri çek
  const { data: teamMembers, error } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId);

  if (error) {
    console.error("Takım üyeleri getirilemedi:", error);
    return { availableMembers: [], error: error.message };
  }

  // Organizasyonda olmayanları filtrele
  const availableUserIds = (teamMembers || [])
    .filter((tm) => !existingUserIds.has(tm.user_id))
    .map((tm) => tm.user_id);

  if (availableUserIds.length === 0) {
    return { availableMembers: [], error: null };
  }

  // Profil bilgilerini çek
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", availableUserIds);

  return { availableMembers: profilesData || [], error: null };
}

// --- KULLANICININ TAKIM LİSTESİNİ GETİR ---
export async function getUserTeams() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { teams: [], error: "Oturum bulunamadı" };

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      team_id,
      teams ( id, name, slug )
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Takımlar getirilemedi:", error);
    return { teams: [], error: error.message };
  }

  const teams = data?.map((d) => d.teams).filter(Boolean) || [];
  return { teams, error: null };
}
