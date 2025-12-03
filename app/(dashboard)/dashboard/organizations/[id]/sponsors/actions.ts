"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// SPONSOR CRUD İŞLEMLERİ
// ============================================

// --- TÜM SPONSORLARI GETİR ---
export async function getOrganizationSponsors(
  organizationId: string,
  filters?: {
    status?: string;
    priority?: string;
    packageId?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { sponsors: [], error: "Oturum bulunamadı" };

  let query = supabase
    .from("organization_sponsors")
    .select(
      `
      *,
      sponsor_packages ( id, name, amount, currency, color )
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.packageId && filters.packageId !== "all") {
    query = query.eq("package_id", filters.packageId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Sponsorlar getirilemedi:", error);
    return { sponsors: [], error: error.message };
  }

  // Assigned_to için profil bilgilerini ayrı çek
  const assignedUserIds =
    data?.filter((s) => s.assigned_to).map((s) => s.assigned_to) || [];

  let profilesMap: Record<string, any> = {};
  if (assignedUserIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", assignedUserIds);

    profilesMap = (profilesData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);
  }

  const sponsorsWithProfiles = (data || []).map((sponsor) => ({
    ...sponsor,
    assigned_profile: sponsor.assigned_to
      ? profilesMap[sponsor.assigned_to]
      : null,
  }));

  return { sponsors: sponsorsWithProfiles, error: null };
}

// --- TEK SPONSOR GETİR ---
export async function getSponsorById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_sponsors")
    .select(
      `
      *,
      sponsor_packages ( id, name, amount, currency, color, benefits )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Sponsor getirilemedi:", error);
    return { sponsor: null, error: error.message };
  }

  // Assigned_to profil bilgisi
  if (data?.assigned_to) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", data.assigned_to)
      .single();

    return {
      sponsor: { ...data, assigned_profile: profileData },
      error: null,
    };
  }

  return { sponsor: { ...data, assigned_profile: null }, error: null };
}

// --- SPONSOR OLUŞTUR ---
export async function createSponsor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const organizationId = formData.get("organization_id") as string;
  const companyName = formData.get("company_name") as string;
  const companyLogoUrl = formData.get("company_logo_url") as string;
  const companyWebsite = formData.get("company_website") as string;
  const companyDescription = formData.get("company_description") as string;
  const industry = formData.get("industry") as string;
  const companySize = formData.get("company_size") as string;
  const contactName = formData.get("contact_name") as string;
  const contactTitle = formData.get("contact_title") as string;
  const contactEmail = formData.get("contact_email") as string;
  const contactPhone = formData.get("contact_phone") as string;
  const contactLinkedin = formData.get("contact_linkedin") as string;
  const packageId = formData.get("package_id") as string;
  const customAmount = formData.get("custom_amount") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const notes = formData.get("notes") as string;
  const nextFollowupDate = formData.get("next_followup_date") as string;

  const { data, error } = await supabase
    .from("organization_sponsors")
    .insert({
      organization_id: organizationId,
      company_name: companyName,
      company_logo_url: companyLogoUrl || null,
      company_website: companyWebsite || null,
      company_description: companyDescription || null,
      industry: industry || null,
      company_size: companySize || null,
      contact_name: contactName || null,
      contact_title: contactTitle || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      contact_linkedin: contactLinkedin || null,
      package_id: packageId || null,
      custom_amount: customAmount ? parseFloat(customAmount) : null,
      status: status || "potential",
      priority: priority || "medium",
      notes: notes || null,
      next_followup_date: nextFollowupDate || null,
      assigned_to: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Sponsor oluşturulamadı:", error);
    throw new Error("Sponsor oluşturulamadı");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true, sponsorId: data.id };
}

// --- SPONSOR GÜNCELLE ---
export async function updateSponsor(id: string, formData: FormData) {
  const supabase = await createClient();

  const organizationId = formData.get("organization_id") as string;
  const updateData: Record<string, any> = {};

  const fields = [
    "company_name",
    "company_logo_url",
    "company_website",
    "company_description",
    "industry",
    "company_size",
    "contact_name",
    "contact_title",
    "contact_email",
    "contact_phone",
    "contact_linkedin",
    "package_id",
    "custom_amount",
    "status",
    "priority",
    "notes",
    "next_followup_date",
    "assigned_to",
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null) {
      if (field === "custom_amount" && value) {
        updateData[field] = parseFloat(value as string);
      } else if (value === "") {
        updateData[field] = null;
      } else {
        updateData[field] = value;
      }
    }
  });

  const { error } = await supabase
    .from("organization_sponsors")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Sponsor güncellenemedi:", error);
    throw new Error("Sponsor güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// --- SPONSOR DURUMU GÜNCELLE ---
export async function updateSponsorStatus(
  id: string,
  status: string,
  organizationId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_sponsors")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Sponsor durumu güncellenemedi:", error);
    throw new Error("Durum güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// --- SPONSOR SİL ---
export async function deleteSponsor(id: string, organizationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_sponsors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Sponsor silinemedi:", error);
    throw new Error("Sponsor silinemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// ============================================
// İLETİŞİM GEÇMİŞİ İŞLEMLERİ
// ============================================

// --- İLETİŞİM GEÇMİŞİNİ GETİR ---
export async function getSponsorContacts(sponsorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsor_contacts")
    .select("*")
    .eq("sponsor_id", sponsorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("İletişim geçmişi getirilemedi:", error);
    return { contacts: [], error: error.message };
  }

  // Kullanıcı bilgilerini çek
  const userIds = data?.map((c) => c.created_by) || [];
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    profilesMap = (profilesData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);
  }

  const contactsWithProfiles = (data || []).map((contact) => ({
    ...contact,
    profiles: profilesMap[contact.created_by] || null,
  }));

  return { contacts: contactsWithProfiles, error: null };
}

// --- İLETİŞİM KAYDI EKLE ---
export async function addSponsorContact(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı");

  const sponsorId = formData.get("sponsor_id") as string;
  const organizationId = formData.get("organization_id") as string;
  const contactType = formData.get("contact_type") as string;
  const subject = formData.get("subject") as string;
  const content = formData.get("content") as string;
  const outcome = formData.get("outcome") as string;
  const meetingDate = formData.get("meeting_date") as string;
  const meetingLocation = formData.get("meeting_location") as string;

  const { error } = await supabase.from("sponsor_contacts").insert({
    sponsor_id: sponsorId,
    contact_type: contactType,
    subject: subject || null,
    content: content || null,
    outcome: outcome || null,
    meeting_date: meetingDate || null,
    meeting_location: meetingLocation || null,
    created_by: user.id,
  });

  if (error) {
    console.error("İletişim kaydı eklenemedi:", error);
    throw new Error("İletişim kaydı eklenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// --- İLETİŞİM KAYDI SİL ---
export async function deleteSponsorContact(id: string, organizationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sponsor_contacts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("İletişim kaydı silinemedi:", error);
    throw new Error("İletişim kaydı silinemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// ============================================
// SPONSORLUK PAKETLERİ İŞLEMLERİ
// ============================================

// --- PAKETLERİ GETİR ---
export async function getSponsorPackages(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsor_packages")
    .select("*")
    .eq("organization_id", organizationId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Paketler getirilemedi:", error);
    return { packages: [], error: error.message };
  }

  return { packages: data || [], error: null };
}

// --- PAKET OLUŞTUR ---
export async function createSponsorPackage(formData: FormData) {
  const supabase = await createClient();

  const organizationId = formData.get("organization_id") as string;
  const name = formData.get("name") as string;
  const tier = formData.get("tier") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const currency = formData.get("currency") as string;
  const maxSponsors = formData.get("max_sponsors") as string;
  const color = formData.get("color") as string;
  const benefitsStr = formData.get("benefits") as string;

  let benefits: string[] = [];
  try {
    benefits = benefitsStr ? JSON.parse(benefitsStr) : [];
  } catch {
    benefits = benefitsStr ? benefitsStr.split(",").map((b) => b.trim()) : [];
  }

  // Son sıra numarasını bul
  const { data: lastPackage } = await supabase
    .from("sponsor_packages")
    .select("order_index")
    .eq("organization_id", organizationId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (lastPackage?.order_index ?? -1) + 1;

  const { error } = await supabase.from("sponsor_packages").insert({
    organization_id: organizationId,
    name,
    tier: tier || "gold",
    description: description || null,
    amount: parseFloat(amount),
    currency: currency || "TRY",
    max_sponsors: maxSponsors ? parseInt(maxSponsors) : null,
    color: color || null,
    benefits,
    order_index: orderIndex,
  });

  if (error) {
    console.error("Paket oluşturulamadı:", error);
    throw new Error("Paket oluşturulamadı");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// --- PAKET GÜNCELLE ---
export async function updateSponsorPackage(id: string, formData: FormData) {
  const supabase = await createClient();

  const organizationId = formData.get("organization_id") as string;
  const name = formData.get("name") as string;
  const amount = formData.get("amount") as string;
  const currency = formData.get("currency") as string;
  const maxSponsors = formData.get("max_sponsors") as string;
  const color = formData.get("color") as string;
  const benefitsStr = formData.get("benefits") as string;

  let benefits: string[] = [];
  try {
    benefits = benefitsStr ? JSON.parse(benefitsStr) : [];
  } catch {
    benefits = benefitsStr ? benefitsStr.split(",").map((b) => b.trim()) : [];
  }

  const { error } = await supabase
    .from("sponsor_packages")
    .update({
      name,
      amount: parseFloat(amount),
      currency: currency || "TRY",
      max_sponsors: maxSponsors ? parseInt(maxSponsors) : null,
      color: color || null,
      benefits,
    })
    .eq("id", id);

  if (error) {
    console.error("Paket güncellenemedi:", error);
    throw new Error("Paket güncellenemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// --- PAKET SİL ---
export async function deleteSponsorPackage(id: string, organizationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sponsor_packages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Paket silinemedi:", error);
    throw new Error("Paket silinemedi");
  }

  revalidatePath(`/dashboard/organizations/${organizationId}/sponsors`);
  return { success: true };
}

// ============================================
// İSTATİSTİKLER
// ============================================

export async function getSponsorStats(organizationId: string) {
  const supabase = await createClient();

  // Tüm sponsorları çek
  const { data: sponsors } = await supabase
    .from("organization_sponsors")
    .select("status, custom_amount, package_id")
    .eq("organization_id", organizationId);

  // Paketleri çek
  const { data: packages } = await supabase
    .from("sponsor_packages")
    .select("id, amount")
    .eq("organization_id", organizationId);

  const packageAmounts = (packages || []).reduce((acc, p) => {
    acc[p.id] = p.amount;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: sponsors?.length || 0,
    potential: 0,
    contacted: 0,
    negotiating: 0,
    proposalSent: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    approvedAmount: 0,
  };

  (sponsors || []).forEach((s) => {
    // Durum bazlı sayı
    switch (s.status) {
      case "potential":
        stats.potential++;
        break;
      case "contacted":
        stats.contacted++;
        break;
      case "negotiating":
        stats.negotiating++;
        break;
      case "proposal_sent":
        stats.proposalSent++;
        break;
      case "approved":
        stats.approved++;
        break;
      case "rejected":
        stats.rejected++;
        break;
    }

    // Tutar hesaplama
    const amount =
      s.custom_amount || (s.package_id ? packageAmounts[s.package_id] : 0) || 0;
    stats.totalAmount += amount;
    if (s.status === "approved") {
      stats.approvedAmount += amount;
    }
  });

  return { stats, error: null };
}
