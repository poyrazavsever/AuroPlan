# Aura Plan - Kapsamlı Ürün Planlaması ve MVP Yol Haritası

## 1. Ürün Vizyonu ve Strateji
**Aura Plan**, geleneksel proje yönetim araçlarının soğukluğunu kıran, hem **iş takibi (Productivity)** hem de **kişisel gelişim (Growth)** süreçlerini tek bir çatı altında birleştiren yeni nesil bir SaaS platformudur.

**Temel Değer Önermesi:** "Sadece işini yapma, işini yaparken geliş."

### Hedef Kitle (Personas)
1.  **Bireysel Kullanıcı:** Kendi görevlerini organize etmek ve yetkinliklerini geliştirmek isteyen profesyoneller.
2.  **Takım Lideri:** Ekibinin iş yükünü yöneten, onlara görev atayan ve gelişim materyalleri (Onboarding, Teknik Dokümanlar) sunan yöneticiler.
3.  **Takım Üyesi:** Atanan görevleri tamamlayan, takım içi kaynaklardan öğrenen ve XP kazanarak motive olan çalışanlar.

---

## 2. Fonksiyonel Gereksinimler (Detaylı Özellik Seti)

### A. Kimlik ve Güvenlik (Authentication & Security)
* **Giriş/Kayıt:** E-posta & Şifre (Magic Link opsiyonel).
* **Onboarding:** İlk girişte kullanıcıyı karşılayan ve profilini (Avatar, Unvan) oluşturmasını sağlayan sihirbaz.
* **Güvenlik:** Tüm veriler Supabase RLS (Row Level Security) ile korunur. Kullanıcı sadece üyesi olduğu takımın verisini görebilir.

### B. Çalışma Alanı ve Takım Yönetimi (Workspace Core) - *Kritik Eksik*
* **Çoklu Takım Desteği:** Bir kullanıcı birden fazla takıma üye olabilir veya sahip olabilir.
* **Takım Oluşturma:** Yeni bir çalışma alanı oluşturma, logo ve isim belirleme.
* **Üye Yönetimi:**
    * Davet Sistemi (E-posta ile veya Davet Linki ile).
    * Rol Yönetimi (Sahip, Admin, Üye, İzleyici).
    * Üye Çıkarma / Yetki Değiştirme.
* **Takım Değiştirici (Switcher):** Sidebar üzerinden takımlar arası hızlı geçiş.

### C. Gelişmiş Görev Yönetimi (Task Management)
* **Görünüm Modları:** Kanban (Pano), Liste (Tablo), Takvim (Gelecek Özellik).
* **Görev Detayları:**
    * **Atama:** Görevi bir takım üyesine atama (Avatar ile gösterim).
    * **Zamanlama:** Bitiş tarihi (Due Date) ve Hatırlatıcılar.
    * **Öncelik:** Renkli etiketler (Düşük, Orta, Yüksek, Kritik).
    * **Zengin İçerik:** Açıklama alanında Markdown desteği.
    * **Ekler:** Dosya ve görsel yükleme (Supabase Storage).
    * **Aktivite:** "Ahmet bu görevi 'Yapılıyor'a taşıdı" logları.

### D. Mikro Öğrenme ve Gelişim (LMS Lite)
* **İçerik Yönetimi (CMS):** Takım liderleri için PDF, Markdown veya Video Linki yükleme alanı.
* **Kategorizasyon:** İçerikleri etiketleme (Örn: "Oryantasyon", "Teknik", "Satış").
* **Tüketim Deneyimi:**
    * PDF Gömülü Okuyucu (Embed).
    * Formatlı Metin Okuyucu.
* **Gamification (Oyunlaştırma):**
    * **XP Sistemi:** Her görev ve eğitim tamamlamada puan kazanımı.
    * **Seviye (Level):** Puan biriktikçe artan kullanıcı seviyesi.
    * **Liderlik Tablosu:** Takım içindeki en aktif üyelerin sıralaması (Motivasyon için).

### E. Dashboard ve Raporlama
* **Kişisel Özet:** "Bugün yapman gereken 3 görev var."
* **Takım Özeti:** "Bu hafta takım %85 verimlilikle çalıştı."
* **Aktivite Akışı:** Takımda neler olup bittiğini gösteren zaman tüneli.

---

## 3. Teknik Mimari ve Veritabanı (Supabase Schema)

Sistem aşağıdaki ilişkisel tablolar üzerine kuruludur:

1.  **`profiles`**: `id`, `full_name`, `avatar_url`, `total_xp`, `level`.
2.  **`teams`**: `id`, `name`, `slug`, `owner_id`, `created_at`.
3.  **`team_members`**: `team_id`, `user_id`, `role` (enum: owner, admin, member).
4.  **`tasks`**: `id`, `team_id`, `title`, `description`, `status`, `priority`, `assigned_to`, `due_date`, `created_by`.
5.  **`micro_learnings`**: `id`, `team_id`, `title`, `content_type` (pdf/md), `content_url`, `xp_value`, `category`.
6.  **`user_progress`**: `user_id`, `learning_id`, `completed_at` (Hangi kullanıcı neyi bitirdi?).
7.  **`activity_logs`**: `id`, `team_id`, `user_id`, `action`, `metadata` (Denetim izi).

---

## 4. Adım Adım Uygulama Planı (Roadmap)

Şu anki aşamada temel altyapı hazır. Eksik olan "Takım" katmanını inşa ederek ilerleyeceğiz.

### Faz 1: Takım Altyapısı (Öncelikli)
1.  **Takım Oluşturma:** `/dashboard/teams/create` sayfası ve formu.
2.  **Takım Seçimi:** Sidebar'daki dropdown'ı aktif hale getirme (Global State veya URL params ile yönetimi).
3.  **Middleware Güncellemesi:** Seçili bir takım yoksa kullanıcıyı "Takım Seç/Oluştur" ekranına yönlendirme mantığı.

### Faz 2: Takım Entegrasyonu
1.  **Görevler:** Görev oluştururken `team_id` bilgisini otomatik ekleme. Görevleri sadece o takıma ait olanlarla filtreleme.
2.  **Öğrenme:** İçerik yüklerken `team_id` ile ilişkilendirme (Şu anki kodda var ama UI eksik).

### Faz 3: Sosyal Özellikler & Gamification
1.  **Görev Atama UI:** Görev kartında "Kime Ata?" dropdown'ı (Takım üyelerini listeler).
2.  **Liderlik Tablosu:** Dashboard ana sayfasına "Ayın Çalışanı" widget'ı.

### Faz 4: Cila ve Lansman
1.  **Profil Ayarları:** Kullanıcının kendi bilgilerini güncellemesi.
2.  **Hata Yönetimi:** Boş durumlar (Empty States) ve Yükleniyor (Skeleton) ekranları.