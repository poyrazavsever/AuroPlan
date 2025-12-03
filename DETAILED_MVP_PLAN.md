# 🎯 AuroPlan - Organizasyon Yönetimi Modülü

## Detaylı MVP Geliştirme Planı

> Bu doküman, AuroPlan'ın Organizasyon Yönetimi modülünün faz faz geliştirme planını içerir.
> Son güncelleme: 3 Aralık 2025

---

## 📋 Modül Genel Bakış

### Organizasyon Nedir?

Organizasyon, takımların veya bireylerin düzenlediği etkinliklerin (hackathon, konferans, meetup, workshop vb.) tüm süreçlerini tek bir panelden yönetmelerini sağlayan modüldür.

### Organizasyon Türleri

| Tür                   | Açıklama                     | Örnek                        |
| --------------------- | ---------------------------- | ---------------------------- |
| 🏆 Hackathon          | Yazılım/tasarım maratonları  | 24 Saatlik Kodlama Yarışması |
| 🎤 Konferans / Summit | Büyük ölçekli etkinlikler    | Tech Summit 2025             |
| 🎓 Workshop / Eğitim  | Uygulamalı öğrenme seansları | React Workshop               |
| 🤝 Meetup / Buluşma   | Topluluk buluşmaları         | Aylık Developer Meetup       |
| 🎉 Sosyal Etkinlik    | Networking, kutlama          | Yılsonu Partisi              |
| 📊 Webinar            | Online seminerler            | AI Trendleri Webinarı        |
| 🏃 Sprint / Jam       | Yoğun çalışma dönemleri      | Game Jam                     |

### Kapsam Seviyeleri

- **🧑 Bireysel**: Kişisel etkinlikler ve organizasyonlar
- **👥 Takım**: Takım genelinde yönetilen organizasyonlar
- **📁 Proje**: Projeye özel etkinlikler (örn. proje lansmanı)

---

## 🏗️ Veritabanı Şeması Özeti

### Ana Tablolar

```
organizations                 # Ana organizasyon tablosu
organization_members          # Organizasyon üyeleri ve rolleri
organization_milestones       # Yol haritası / kilometre taşları
organization_sponsors         # Sponsor kayıtları
sponsor_contacts              # Sponsor iletişim geçmişi
sponsor_packages              # Sponsorluk paketleri
organization_documents        # Dokümanlar ve dosyalar
document_folders              # Klasör yapısı
organization_tasks            # Organizasyon görevleri (veya tasks'e FK)
organization_registrations    # Katılımcı kayıtları
organization_sessions         # Program oturumları
speakers                      # Konuşmacılar
organization_budgets          # Bütçe planları
transactions                  # Gelir/gider kayıtları
```

---

## 🚀 FAZ 1: Temel Altyapı

**Öncelik:** 🔴 Kritik | **Süre:** ~3-4 gün

### 1.1 Hedefler

- Organizasyon CRUD işlemleri
- Temel veritabanı şeması
- Liste ve detay sayfaları
- Üye yönetimi
- Yol haritası (Milestones)

### 1.2 Veritabanı Şeması

```sql
-- organizations tablosu
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Temel Bilgiler
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- hackathon, conference, workshop, meetup, social, webinar, sprint

    -- Kapsam
    scope VARCHAR(20) NOT NULL DEFAULT 'team', -- personal, team, project
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),

    -- Tarih & Konum
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    location_type VARCHAR(20) DEFAULT 'physical', -- physical, online, hybrid
    location_name VARCHAR(255), -- Mekan adı
    location_address TEXT, -- Fiziksel adres
    location_url VARCHAR(500), -- Online link (Zoom, Meet, vb.)
    location_coordinates JSONB, -- {lat, lng} - Harita için

    -- Durum & Görünürlük
    status VARCHAR(20) DEFAULT 'draft', -- draft, planning, active, completed, cancelled
    visibility VARCHAR(20) DEFAULT 'private', -- private, team, public

    -- Görsel & Meta
    cover_image_url VARCHAR(500),
    logo_url VARCHAR(500),
    color_theme VARCHAR(7) DEFAULT '#3B82F6', -- HEX renk kodu
    metadata JSONB DEFAULT '{}',

    -- İstatistikler (denormalize)
    total_sponsors INT DEFAULT 0,
    total_budget DECIMAL(12,2) DEFAULT 0,
    total_registrations INT DEFAULT 0,

    -- Zaman Damgaları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- organization_members tablosu
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    role VARCHAR(30) NOT NULL DEFAULT 'member',
    -- owner: Tam yetki, organizasyonu oluşturan
    -- organizer: Yönetici, tüm bölümlere erişim
    -- coordinator: Belirli alanlarda yetki (sponsor, lojistik vb.)
    -- volunteer: Gönüllü, görev alabilir
    -- member: Sadece görüntüleme

    department VARCHAR(50), -- sponsorship, logistics, content, technical, marketing, finance
    permissions JSONB DEFAULT '[]', -- Özel izinler

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- organization_milestones tablosu
CREATE TABLE organization_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    order_index INT DEFAULT 0,

    -- İlerleme
    progress INT DEFAULT 0, -- 0-100

    -- Meta
    color VARCHAR(7), -- HEX renk
    icon VARCHAR(50), -- Iconify icon adı

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.3 Dosya Yapısı

```
app/(dashboard)/dashboard/
  organizations/
    actions.ts                  # Server actions (CRUD)
    page.tsx                    # Liste sayfası
    OrganizationsPageClient.tsx # Client component
    create/
      page.tsx                  # Oluşturma sayfası
    [id]/
      page.tsx                  # Detay sayfası
      OrganizationDetailClient.tsx

components/
  organizations/
    OrganizationCard.tsx        # Liste kartı
    CreateOrganizationModal.tsx # Oluşturma modalı
    OrganizationHeader.tsx      # Detay sayfa header
    OrganizationStats.tsx       # İstatistik kartları
    MilestonesList.tsx          # Yol haritası listesi
    NewMilestoneModal.tsx       # Milestone ekleme
    MembersList.tsx             # Üye listesi
    AddMemberModal.tsx          # Üye ekleme
```

### 1.4 UI Bileşenleri

#### OrganizationCard

- Organizasyon adı, türü, tarihi
- Durum badge'i (Taslak, Planlama, Aktif, vb.)
- Kapsam (Takım/Proje adı)
- Cover image
- Hızlı aksiyonlar (Düzenle, Sil)

#### OrganizationHeader

- Cover image
- Logo
- Ad, tür, tarih aralığı
- Konum bilgisi
- Durum değiştirme
- Düzenleme butonu

#### MilestonesList

- Proje sayfasındaki gibi timeline görünümü
- Sürükle-bırak sıralama
- Durum güncelleme
- İlerleme çubuğu

### 1.5 Server Actions

```typescript
// organizations/actions.ts
- getOrganizations(teamId?: string)
- getOrganizationById(id: string)
- createOrganization(data: CreateOrganizationInput)
- updateOrganization(id: string, data: UpdateOrganizationInput)
- deleteOrganization(id: string)
- updateOrganizationStatus(id: string, status: string)

// Milestones
- getOrganizationMilestones(organizationId: string)
- createMilestone(data: CreateMilestoneInput)
- updateMilestone(id: string, data: UpdateMilestoneInput)
- deleteMilestone(id: string)
- reorderMilestones(milestones: {id: string, order_index: number}[])

// Members
- getOrganizationMembers(organizationId: string)
- addOrganizationMember(organizationId: string, userId: string, role: string)
- updateMemberRole(memberId: string, role: string)
- removeMember(memberId: string)
```

### 1.6 Sidebar Güncellemesi

```typescript
// Sidebar.tsx - menuGroups içine ekle
{
  title: "Etkinlik Yönetimi",
  items: [
    {
      title: "Organizasyonlar",
      path: "/dashboard/organizations",
      icon: "heroicons:calendar-days",
      badge: "Yeni",
      badgeColor: "bg-purple-100 text-purple-700",
    },
  ],
}
```

### 1.7 Kabul Kriterleri

- [ ] Organizasyon oluşturulabilmeli (ad, tür, tarih, konum, kapsam)
- [ ] Organizasyonlar listelenebilmeli (kart görünümü)
- [ ] Organizasyon detay sayfası çalışmalı
- [ ] Milestone eklenip düzenlenebilmeli
- [ ] Üye eklenip çıkarılabilmeli
- [ ] RLS politikaları aktif olmalı

---

## 🤝 FAZ 2: Sponsor & Paydaş Yönetimi

**Öncelik:** 🔴 Kritik | **Süre:** ~3-4 gün

### 2.1 Hedefler

- CRM benzeri sponsor takip sistemi
- Sponsor durumları ve pipeline
- İletişim geçmişi kaydı
- Sponsorluk paketleri
- Bütçe hedefi takibi

### 2.2 Veritabanı Şeması

```sql
-- organization_sponsors tablosu
CREATE TABLE organization_sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Sponsor Bilgileri
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(500),
    company_website VARCHAR(500),
    company_description TEXT,
    industry VARCHAR(100), -- Sektör
    company_size VARCHAR(50), -- startup, small, medium, enterprise

    -- İletişim Kişisi
    contact_name VARCHAR(255),
    contact_title VARCHAR(100), -- Pozisyon
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_linkedin VARCHAR(500),

    -- Sponsorluk Detayları
    package_id UUID REFERENCES sponsor_packages(id),
    custom_amount DECIMAL(12,2), -- Özel tutar
    currency VARCHAR(3) DEFAULT 'TRY',

    -- Durum Pipeline
    status VARCHAR(30) DEFAULT 'potential',
    -- potential: Potansiyel
    -- contacted: İletişime geçildi
    -- negotiating: Görüşme aşamasında
    -- proposal_sent: Teklif gönderildi
    -- approved: Onaylandı
    -- rejected: Reddedildi
    -- cancelled: İptal edildi

    -- Öncelik & Notlar
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    notes TEXT,
    tags JSONB DEFAULT '[]',

    -- Takip
    assigned_to UUID REFERENCES auth.users(id),
    next_followup_date DATE,

    -- Zaman Damgaları
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sponsor_contacts tablosu (İletişim geçmişi)
CREATE TABLE sponsor_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id UUID NOT NULL REFERENCES organization_sponsors(id) ON DELETE CASCADE,

    contact_type VARCHAR(30) NOT NULL, -- email, call, meeting, message, other
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(50), -- positive, neutral, negative, pending

    -- Toplantı bilgileri
    meeting_date TIMESTAMP WITH TIME ZONE,
    meeting_location VARCHAR(255),
    attendees JSONB DEFAULT '[]', -- [{user_id, name}]

    -- Dosya ekleri
    attachments JSONB DEFAULT '[]', -- [{name, url, type}]

    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sponsor_packages tablosu
CREATE TABLE sponsor_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL, -- Platinum, Gold, Silver, Bronze, In-Kind
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',

    -- Paket İçeriği
    benefits JSONB DEFAULT '[]', -- ["Logo web sitede", "Stand alanı", "Konuşma hakkı"]
    max_sponsors INT, -- Bu paketten max kaç sponsor
    current_sponsors INT DEFAULT 0,

    -- Görsel
    color VARCHAR(7), -- HEX renk
    icon VARCHAR(50),
    order_index INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Dosya Yapısı

```
app/(dashboard)/dashboard/organizations/[id]/
  sponsors/
    page.tsx                    # Sponsor yönetimi sayfası
    SponsorsPageClient.tsx

components/organizations/
  sponsors/
    SponsorTable.tsx            # Tablo görünümü
    SponsorCard.tsx             # Kart görünümü
    SponsorKanban.tsx           # Kanban pipeline görünümü
    AddSponsorModal.tsx         # Sponsor ekleme
    EditSponsorModal.tsx        # Sponsor düzenleme
    SponsorDetailModal.tsx      # Detay modalı
    ContactHistoryList.tsx      # İletişim geçmişi
    AddContactModal.tsx         # İletişim kaydı ekleme
    SponsorPackages.tsx         # Paket yönetimi
    CreatePackageModal.tsx      # Paket oluşturma
    SponsorStats.tsx            # İstatistikler
    SponsorPipeline.tsx         # Pipeline özeti
```

### 2.4 UI Bileşenleri

#### SponsorTable

| Şirket    | İletişim           | Paket | Durum        | Tutar     | Son İletişim | Sonraki  | Aksiyonlar   |
| --------- | ------------------ | ----- | ------------ | --------- | ------------ | -------- | ------------ |
| Logo + Ad | İsim, E-posta, Tel | Badge | Status Badge | 50.000 TL | 2 gün önce   | 5 Aralık | Düzenle, Sil |

#### SponsorKanban (Pipeline Görünümü)

```
| Potansiyel | İletişimde | Görüşme | Teklif | Onaylı | Reddedildi |
| --------- | ---------- | ------- | ------ | ------ | ---------- |
| [Kart]    | [Kart]     | [Kart]  | [Kart] | [Kart] | [Kart]     |
| [Kart]    |            | [Kart]  |        | [Kart] |            |
```

#### SponsorStats

- Toplam Sponsor Sayısı
- Onaylanan Sponsorlar
- Toplanan Tutar / Hedef
- Dönüşüm Oranı (%)

### 2.5 Server Actions

```typescript
// sponsors/actions.ts
- getOrganizationSponsors(organizationId: string, filters?: SponsorFilters)
- getSponsorById(id: string)
- createSponsor(data: CreateSponsorInput)
- updateSponsor(id: string, data: UpdateSponsorInput)
- updateSponsorStatus(id: string, status: string)
- deleteSponsor(id: string)

// İletişim Geçmişi
- getSponsorContacts(sponsorId: string)
- addSponsorContact(data: CreateContactInput)
- deleteContact(id: string)

// Paketler
- getSponsorPackages(organizationId: string)
- createPackage(data: CreatePackageInput)
- updatePackage(id: string, data: UpdatePackageInput)
- deletePackage(id: string)

// İstatistikler
- getSponsorStats(organizationId: string)
```

### 2.6 Kabul Kriterleri

- [ ] Sponsor eklenip düzenlenebilmeli
- [ ] Tablo ve Kanban görünümü çalışmalı
- [ ] Sponsor durumu (pipeline) güncellenebilmeli
- [ ] İletişim geçmişi kaydedilebilmeli
- [ ] Sponsorluk paketleri oluşturulabilmeli
- [ ] Toplam bütçe ve hedef görüntülenebilmeli

---

## ✅ FAZ 3: Görev & İş Akışı Yönetimi

**Öncelik:** 🔴 Kritik | **Süre:** ~2-3 gün

### 3.1 Hedefler

- Organizasyona özel görevler
- Mevcut task sistemiyle entegrasyon
- Görev kategorileri
- Checklist şablonları
- Deadline takibi

### 3.2 Veritabanı Şeması

```sql
-- tasks tablosuna organization_id ekleme (migration)
ALTER TABLE tasks ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN category VARCHAR(50); -- logistics, communication, technical, content, finance, marketing

-- task_templates tablosu (opsiyonel)
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_type VARCHAR(50), -- hackathon, conference, vb. (null = tümü)

    tasks JSONB NOT NULL, -- [{title, description, category, relative_days}]
    -- relative_days: Etkinlik tarihine göre kaç gün önce

    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Dosya Yapısı

```
app/(dashboard)/dashboard/organizations/[id]/
  tasks/
    page.tsx                    # Görev sayfası

components/organizations/
  tasks/
    OrganizationTasksBoard.tsx  # Kanban board
    TaskCategoryFilter.tsx      # Kategori filtresi
    TaskTemplateSelector.tsx    # Şablon seçici
    TaskCountdown.tsx           # Etkinliğe kalan süre
```

### 3.4 Görev Kategorileri

| Kategori     | İkon                    | Renk   | Örnek Görevler                        |
| ------------ | ----------------------- | ------ | ------------------------------------- |
| 📦 Lojistik  | heroicons:truck         | Orange | Mekan rezervasyonu, Yemek siparişi    |
| 📣 İletişim  | heroicons:megaphone     | Blue   | Sponsor mail, Sosyal medya paylaşımı  |
| 💻 Teknik    | heroicons:code-bracket  | Purple | Web sitesi, Kayıt sistemi             |
| 📝 İçerik    | heroicons:document-text | Green  | Program hazırlama, Konuşmacı brifingi |
| 💰 Finans    | heroicons:banknotes     | Yellow | Fatura takibi, Bütçe güncelleme       |
| 🎨 Pazarlama | heroicons:paint-brush   | Pink   | Afiş tasarımı, Video hazırlama        |

### 3.5 Kabul Kriterleri

- [ ] Organizasyon görevleri listelenebilmeli
- [ ] Görev oluşturulurken kategori seçilebilmeli
- [ ] Kategoriye göre filtreleme çalışmalı
- [ ] Etkinlik tarihine countdown görünmeli
- [ ] (Opsiyonel) Şablondan görev oluşturulabilmeli

---

## 📁 FAZ 4: Doküman & Kaynak Yönetimi

**Öncelik:** 🟡 Orta | **Süre:** ~2-3 gün

### 4.1 Hedefler

- Merkezi dosya deposu
- Klasör yapısı
- Şablon kütüphanesi
- Dış paylaşım linkleri

### 4.2 Veritabanı Şeması

```sql
-- document_folders tablosu
CREATE TABLE document_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    order_index INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- organization_documents tablosu
CREATE TABLE organization_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,

    -- Paylaşım
    is_public BOOLEAN DEFAULT false,
    share_link UUID, -- Benzersiz paylaşım linki
    share_expires_at TIMESTAMP WITH TIME ZONE,

    -- Meta
    description TEXT,
    tags JSONB DEFAULT '[]',
    version INT DEFAULT 1,

    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_templates tablosu
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- contract, invitation, press, proposal
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),

    organization_type VARCHAR(50), -- Belirli etkinlik türü için
    is_public BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 Varsayılan Klasörler

Her organizasyon oluşturulduğunda otomatik klasörler:

- 📂 Sponsorluk (Sözleşmeler, Teklifler)
- 📂 Lojistik (Mekan, Ekipman)
- 📂 İçerik (Program, Sunumlar)
- 📂 Basın Kiti (Logo, Banner, Fotoğraflar)
- 📂 Finans (Faturalar, Makbuzlar)

### 4.4 Kabul Kriterleri

- [ ] Dosya yüklenebilmeli
- [ ] Klasör oluşturulabilmeli
- [ ] Dosyalar klasörlere taşınabilmeli
- [ ] Paylaşım linki oluşturulabilmeli
- [ ] Şablon kütüphanesinden indirilebilmeli

---

## 👥 FAZ 5: Katılımcı & Kayıt Yönetimi

**Öncelik:** 🟡 Orta | **Süre:** ~4-5 gün

### 5.1 Hedefler

- Kayıt formu oluşturucu
- Katılımcı listesi yönetimi
- Bilet türleri
- Check-in sistemi
- E-posta bildirimleri

### 5.2 Veritabanı Şeması

```sql
-- ticket_types tablosu
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL, -- Ücretsiz, Erken Kayıt, Normal, VIP
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'TRY',

    quantity INT, -- null = sınırsız
    sold_count INT DEFAULT 0,

    -- Satış dönemi
    sale_start_date TIMESTAMP WITH TIME ZONE,
    sale_end_date TIMESTAMP WITH TIME ZONE,

    -- Avantajlar
    benefits JSONB DEFAULT '[]',

    is_active BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- registration_fields tablosu (Form alanları)
CREATE TABLE registration_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(30) NOT NULL, -- text, email, phone, select, checkbox, textarea, file
    field_label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    options JSONB, -- select için seçenekler

    is_required BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- organization_registrations tablosu
CREATE TABLE organization_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id),

    -- Temel Bilgiler
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),

    -- Dinamik form verileri
    form_data JSONB DEFAULT '{}',

    -- Durum
    status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, cancelled, attended

    -- Check-in
    check_in_code VARCHAR(20) UNIQUE, -- QR kod için
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES auth.users(id),

    -- Ödeme (ücretli etkinlikler için)
    payment_status VARCHAR(20), -- pending, paid, refunded
    payment_amount DECIMAL(10,2),
    payment_reference VARCHAR(100),

    -- Meta
    source VARCHAR(50), -- website, manual, import
    notes TEXT,

    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- check_ins tablosu (Check-in geçmişi)
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES organization_registrations(id) ON DELETE CASCADE,

    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_in_type VARCHAR(20) DEFAULT 'entry', -- entry, exit, session
    session_id UUID REFERENCES organization_sessions(id),

    checked_by UUID REFERENCES auth.users(id),
    device_info JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.3 Kabul Kriterleri

- [ ] Kayıt formu alanları özelleştirilebilmeli
- [ ] Bilet türleri tanımlanabilmeli
- [ ] Katılımcılar listelenebilmeli
- [ ] Manuel katılımcı eklenebilmeli
- [ ] CSV'den import yapılabilmeli
- [ ] QR kod ile check-in yapılabilmeli
- [ ] Katılımcıya e-posta gönderilebilmeli

---

## 💰 FAZ 6: Bütçe & Finans Yönetimi

**Öncelik:** 🟡 Orta | **Süre:** ~2-3 gün

### 6.1 Hedefler

- Bütçe planı oluşturma
- Gelir/gider takibi
- Kategori bazlı raporlama
- Makbuz/fatura yükleme

### 6.2 Veritabanı Şeması

```sql
-- organization_budgets tablosu
CREATE TABLE organization_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    category VARCHAR(50) NOT NULL, -- venue, catering, marketing, equipment, travel, speaker, other
    name VARCHAR(255) NOT NULL,
    planned_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'TRY',

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- transactions tablosu
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES organization_budgets(id) ON DELETE SET NULL,
    sponsor_id UUID REFERENCES organization_sponsors(id) ON DELETE SET NULL,

    type VARCHAR(20) NOT NULL, -- income, expense
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',

    -- Ödeme detayları
    payment_date DATE,
    payment_method VARCHAR(30), -- cash, bank_transfer, credit_card, other
    reference_number VARCHAR(100),

    -- Belge
    receipt_url VARCHAR(500),
    receipt_file_name VARCHAR(255),

    -- Meta
    tags JSONB DEFAULT '[]',
    notes TEXT,

    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.3 Bütçe Kategorileri

| Kategori     | İkon         | Tipik Kalemler              |
| ------------ | ------------ | --------------------------- |
| 🏢 Mekan     | building     | Salon kirası, Dekorasyon    |
| 🍽️ Yemek     | cake         | Catering, İkramlar          |
| 📢 Pazarlama | megaphone    | Reklam, Baskı, Sosyal medya |
| 🎥 Ekipman   | video-camera | Ses, Işık, Projeksiyon      |
| ✈️ Seyahat   | airplane     | Ulaşım, Konaklama           |
| 🎤 Konuşmacı | microphone   | Honoraryum, Hediye          |
| 📦 Diğer     | cube         | Çeşitli giderler            |

### 6.4 Kabul Kriterleri

- [ ] Bütçe kalemleri oluşturulabilmeli
- [ ] Gelir/gider kaydedilebilmeli
- [ ] Fatura/makbuz yüklenebilmeli
- [ ] Planlanan vs. gerçekleşen karşılaştırılabilmeli
- [ ] Kategori bazlı özet görüntülenebilmeli

---

## 🎤 FAZ 7: Program & Ajanda Yönetimi

**Öncelik:** 🟡 Orta | **Süre:** ~3-4 gün

### 7.1 Hedefler

- Oturum/Session oluşturma
- Konuşmacı yönetimi
- Program timeline görünümü
- Paralel track desteği

### 7.2 Veritabanı Şeması

```sql
-- speakers tablosu
CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Kişisel Bilgiler
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(100), -- Pozisyon
    company VARCHAR(255),
    bio TEXT,
    photo_url VARCHAR(500),

    -- İletişim
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Sosyal Medya
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    website_url VARCHAR(500),

    -- Davet Durumu
    invitation_status VARCHAR(30) DEFAULT 'pending', -- pending, invited, confirmed, declined
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,

    -- Lojistik
    requires_travel BOOLEAN DEFAULT false,
    requires_accommodation BOOLEAN DEFAULT false,
    special_requirements TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- session_tracks tablosu
CREATE TABLE session_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL, -- Ana Salon, Workshop Odası 1, vb.
    color VARCHAR(7),
    capacity INT,
    order_index INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- organization_sessions tablosu
CREATE TABLE organization_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    track_id UUID REFERENCES session_tracks(id) ON DELETE SET NULL,

    -- Temel Bilgiler
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(30) DEFAULT 'talk', -- talk, workshop, panel, break, networking, other

    -- Zaman
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Konuşmacılar (many-to-many için JSONB veya ayrı tablo)
    speaker_ids JSONB DEFAULT '[]', -- [speaker_id, speaker_id]

    -- Detaylar
    location VARCHAR(255), -- Salon/Oda adı
    capacity INT,
    is_featured BOOLEAN DEFAULT false,

    -- Materyaller
    slides_url VARCHAR(500),
    video_url VARCHAR(500),
    resources JSONB DEFAULT '[]',

    -- Meta
    tags JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7.3 Kabul Kriterleri

- [ ] Konuşmacı eklenip düzenlenebilmeli
- [ ] Oturum oluşturulabilmeli
- [ ] Track/salon tanımlanabilmeli
- [ ] Program timeline görüntülenebilmeli
- [ ] Konuşmacı davet durumu takip edilebilmeli

---

## 📢 FAZ 8: İletişim & Duyuru

**Öncelik:** 🟢 Düşük | **Süre:** ~2 gün

### 8.1 Hedefler

- Organizasyon içi duyuru panosu
- E-posta şablonları
- Sosyal medya post taslakları
- Basın kiti oluşturma

### 8.2 Veritabanı Şeması

```sql
-- organization_announcements tablosu
CREATE TABLE organization_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info', -- info, warning, success, urgent

    is_pinned BOOLEAN DEFAULT false,

    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- email_templates tablosu
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    template_type VARCHAR(30), -- sponsor, participant, speaker, general
    variables JSONB DEFAULT '[]', -- [{name, description}]

    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8.3 Kabul Kriterleri

- [ ] Duyuru oluşturulabilmeli
- [ ] E-posta şablonu kaydedilebilmeli
- [ ] Basın kiti dosyaları indirilebilmeli

---

## 📊 FAZ 9: Analitik & Raporlama

**Öncelik:** 🟢 Düşük | **Süre:** ~2-3 gün

### 9.1 Hedefler

- Organizasyon dashboard
- Sponsor dönüşüm oranları
- Katılımcı analizi
- Post-event raporu

### 9.2 Dashboard Metrikleri

| Metrik           | Açıklama                 |
| ---------------- | ------------------------ |
| Toplam Sponsor   | Onaylanan sponsor sayısı |
| Sponsor Geliri   | Toplanan toplam tutar    |
| Dönüşüm Oranı    | Potansiyel → Onaylanan % |
| Kayıt Sayısı     | Toplam katılımcı         |
| Check-in Oranı   | Gelen / Kayıtlı %        |
| Görev İlerlemesi | Tamamlanan / Toplam %    |
| Bütçe Durumu     | Harcanan / Planlanan %   |
| Kalan Süre       | Etkinliğe X gün          |

### 9.3 Kabul Kriterleri

- [ ] Dashboard widget'ları görüntülenebilmeli
- [ ] Sponsor pipeline grafiği çalışmalı
- [ ] Kayıt trend grafiği görüntülenebilmeli
- [ ] PDF rapor oluşturulabilmeli

---

## 🔄 FAZ 10: Şablon & Otomasyon

**Öncelik:** 🟢 Düşük | **Süre:** ~2 gün

### 10.1 Hedefler

- Organizasyon şablonları
- Geçmiş organizasyonu klonlama
- Otomatik hatırlatıcılar
- Tekrarlayan görevler

### 10.2 Kabul Kriterleri

- [ ] Organizasyon şablonu kaydedilebilmeli
- [ ] Şablondan yeni organizasyon oluşturulabilmeli
- [ ] Geçmiş organizasyon klonlanabilmeli
- [ ] Milestone'a göre otomatik görev oluşturulabilmeli

---

## 📅 Tahmini Zaman Çizelgesi

| Faz                        | Süre    | Kümülatif |
| -------------------------- | ------- | --------- |
| Faz 1: Temel Altyapı       | 3-4 gün | 4 gün     |
| Faz 2: Sponsor Yönetimi    | 3-4 gün | 8 gün     |
| Faz 3: Görev Yönetimi      | 2-3 gün | 11 gün    |
| Faz 4: Doküman Yönetimi    | 2-3 gün | 14 gün    |
| Faz 5: Katılımcı Yönetimi  | 4-5 gün | 19 gün    |
| Faz 6: Bütçe Yönetimi      | 2-3 gün | 22 gün    |
| Faz 7: Program Yönetimi    | 3-4 gün | 26 gün    |
| Faz 8: İletişim            | 2 gün   | 28 gün    |
| Faz 9: Analitik            | 2-3 gün | 31 gün    |
| Faz 10: Şablon & Otomasyon | 2 gün   | 33 gün    |

**Toplam:** ~4-5 hafta (tam zamanlı geliştirme)

---

## 🎯 Öncelik Sıralaması (Önerilen Başlangıç)

1. **FAZ 1** → Temel altyapı olmadan hiçbir şey çalışmaz
2. **FAZ 2** → Hackathon için sponsor yönetimi kritik
3. **FAZ 3** → Görev dağılımı organizasyonun kalbi
4. **FAZ 4** → Doküman yönetimi her aşamada gerekli
5. **FAZ 5+** → İhtiyaca göre önceliklendirilebilir

---

## 📝 Notlar

- Her fazın sonunda test ve kod review yapılmalı
- RLS politikaları her tablo için aktif olmalı
- Sidebar'a "Organizasyonlar" menüsü Faz 1'de eklenmeli
- Mevcut proje yapısına (milestone, document, member) paralel tasarım
- XP/Gamification entegrasyonu düşünülebilir (organizasyon tamamlama başarımları)

---

> Bu doküman geliştirme sürecinde güncellenecektir.
> Son güncelleme: 3 Aralık 2025
