# AuroPlan

> Acik-kaynak kimlikli, ekip ici gorev takip ve mikro ogrenme akislari icin hazirlanmis Next.js tabanli uretkenlik platformu.

AuroPlan; kisi veya takim tabanli projelerinizi, Kanban panolarini, kilometre taslarini ve knowledge base'i ayni panelde toplayan Supabase destekli bir gorev takip sistemidir. Kod tabani App Router mimarisi uzerine kuruldugu icin SSR ve edge senaryolarinda olceklenebilir.

## Proje Ozeti

- `app/(site)` altinda landing page, `app/(auth)` altinda Supabase kimlik dogrulamasi ve `app/(dashboard)` altinda asil uygulama deneyimi bulunur.
- Dashboard; gorev, proje, takim, takvim, profil ve mikro ogrenme modullerine ayrilir ve tum ekranlar Supabase veritabanindan dinamik veri ceker.
- `DETAILED_MVP_PLAN.md` ve `DESIGN_SYSTEM.md` dokumanlari urun kararlari ile UI dilini belgeler; acik-kaynak misyonu dogrultusunda surec seffaf tutulur.
- Repoyu forklayip kendi organizasyonunuzda barindirabilir, README'deki adimlari izleyerek dakikalar icinde local ortamda calistirabilirsiniz.

## One Cikan Ozellikler

### Gorev Yonetimi ve Kanban
- `app/(dashboard)/dashboard/tasks/page.tsx` Supabase'deki `tasks` tablosunu **todo / in_progress / done** durumlarina gore gruplandirarak uc kolonlu Kanban olusturur.
- `components/tasks/NewTaskModal.tsx` istemci tarafinda formu acar, `dashboard/tasks/action.ts` icindeki Next.js server action'u ile kayit olusturur ve `revalidatePath` ile gorunumu gunceller.
- Gorev kartlari `types/supabase.ts` icinden gelen tiplerle `priority`, `description`, `assigned_to` gibi alanlari guvende tutar.

### Proje Alanlari
- `app/(dashboard)/dashboard/projects/page.tsx` ayni kullaniciya ait **kisisel workspace** ve **takim workspace**'lerini sekmeli arayuzde toplar, istatistik kartlari ile toplam/aktif proje sayisini sunar.
- `components/projects/*` dosyalari kapak gorseli, kilometre taslari, guncellemeler, dokuman yukleme ve uye davet modallarini kapsar. Dokumanlar `uploadProjectFile` server action'i uzerinden Supabase Storage'taki `project-files` bucket'ina yuklenir.
- Supabase semasi `supabase/projects_schema.sql` dosyasinda yer alir; `projects`, `project_members`, `project_milestones`, `project_updates` ve `project_documents` tablolarini tanimlar.

### Takim Operasyonlari
- `app/(dashboard)/layout.tsx` aktif kullanicinin takimini cekip `components/dashboard/Sidebar` bilesenine aktarir. Sidebar workspace secimi, pro rozetleri ve alt menuyu yonetir.
- `app/(dashboard)/dashboard/team` ile `components/teams/CreateTeamForm.tsx` takim olusturur ve `team_members` tablosu uzerinden owner/admin/member rolleri atar.

### Takvim ve Zaman Cizelgesi
- `components/calendar/CalendarView.tsx` ve `TimelineView.tsx` gorev, proje ve etkinlikleri `date-fns` yardimiyla aylik gorunumde hesaplar ve renk kodlariyla listeler.
- `EventDetailsModal` gun icindeki ogelerin ayrintilarini acan tiklanabilir kartlar saglar; `CalendarItem` tipi metadata sayesinde hangi takima ya da projeye ait oldugunu bilir.

### Mikro Ogrenme Merkezi
- `app/(dashboard)/dashboard/learn/page.tsx` XP tabanli gamification karti, takim-ozel ve herkese acik icerik sekmeleri ile `micro_learnings` tablosunu kullanir.
- `LearningCard`, `UploadForm` ve `CompleteButton` bilesenleri markdown/PDF icerikleri gosterip `user_progress` tablosu ile tamamlama durumlarini takip eder.

## Teknik Mimari

- **Cerceve:** Next.js 16 (App Router) + React 19 + TypeScript 5.
- **Stil ve UI:** Tailwind CSS 4, `clsx`, `tailwind-merge`, Iconify ve `components/ui`, `components/dashboard`, `components/projects` gibi ozel bilesen setleri.
- **Veri Katmani:** Supabase (PostgreSQL, Auth, Storage). `utils/supabase/server.ts` cookie paylasimi ile SSR client olusturur, `utils/supabase/client.ts` tarayici tarafini destekler.
- **Server Actions:** Gorev, proje, ogrenme ve takim modulleri `"use server"` action'lari ile form submit akisini yonetir; `revalidatePath` ve `redirect` kullanarak deneyimi taze tutar.
- **Middleware:** `middleware.ts` korunmus dashboard rotalarina girmeden Supabase oturumunu dogrular.
- **Tip Guvenligi:** `types/supabase.ts` ve `types/calendar.ts` veri modellerini TypeScript ile belgeler, sorgularin tamamini tur guvenli yapar.

## Veri Modeli Ozeti

| Tablo | Amac |
| --- | --- |
| `profiles` | Kullanici profil alanlari, avatar, XP, level. |
| `teams` / `team_members` | Workspace'ler ve rol bazli uyelikler. |
| `tasks` | Durum, oncelik, gorev sahibi alanlariyla kisi veya takim gorevleri. |
| `projects` | Temel proje bilgileri, tarih araligi, durum/oncelik ve opsiyonel metadata. |
| `project_members`, `project_milestones`, `project_updates`, `project_documents` | Proje ici roller, kilometre taslari, kronolojik guncellemeler ve dosya kayitlari. |
| `micro_learnings`, `user_progress` | Mikro ogrenme kartlari ve kullanici tamamlama kayitlari (XP hesaplamasi icin). |

Tum tablolar Row Level Security aktif olacak sekilde tasarlanmistir; detaylar icin `supabase/projects_schema.sql` dosyasina bakabilirsiniz.

## Dizin Ozet

```
app/
  (site)/            -> Landing page
  (auth)/            -> Login & Signup + server actions
  (dashboard)/       -> Dashboard layout ve tum moduller
components/
  dashboard/, tasks/, projects/, calendar/, learn/ ...
supabase/
  PROJECT_SCHEMA.md, projects_schema.sql
types/
  supabase.ts, calendar.ts
utils/
  supabase/ (server & client yardimcilari)
public/
  Images/ ve Logos/ altinda tanitim varliklari
```

## Gelistirme Ortami

1. **Bagimliliklari kurun**
   ```bash
   pnpm install
   ```
2. **Ortam degiskenlerini hazirlayin**  
   `.env.example` dosyasini `.env.local` olarak kopyalayip asagidaki anahtarlari doldurun:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opsiyonel ama storage islemlerinde faydali)
3. **Supabase semasini uygulayin**  
   `supabase/projects_schema.sql` icerigini Supabase SQL Editor'de calistirin, `project-files` bucket'ini olusturun.
4. **Gelisim sunucusunu baslatin**
   ```bash
   pnpm dev
   # http://localhost:3000 -> landing
   # http://localhost:3000/dashboard -> yetkili kullanici paneli
   ```
5. **Kod kalitesini dogrulayin**
   ```bash
   pnpm lint
   ```

## Katki ve Yol Haritasi

AuroPlan acik-kaynak bir gorev takip ve bilgi paylasim platformudur. Yeni ozellikler, hata duzeltmeleri veya Supabase semasi iyilestirmeleri icin pull request gonderebilirsiniz. Baslamadan once:

- `DESIGN_SYSTEM.md` ve `DETAILED_MVP_PLAN.md` dosyalarindaki UX ve yol haritasi notlarini inceleyin.
- Veri modelinde yaptiginiz degisiklikleri `supabase/` altindaki SQL dosyalarina mutlaka isleyin.
- Tartismalari depo uzerinden yurutup acik-kaynak topluluguna geribildirim verin.

> AuroPlan; ekiplerin calismalarini seffaf, takip edilebilir ve ogrenme odakli sekilde ilerletebilmesi icin tasarlandi. Kendi senaryonuza gore uyarlayin, geribildiriminizi paylasin ve acik-kaynak gorev takip sisteminin buyumesine destek olun!
