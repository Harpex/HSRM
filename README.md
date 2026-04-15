# LifeTrack Pro

Kisisel gelisim, gunluk program, hedef, kalori, saglik ve aliskanlik takibi icin React tabanli alpha demo.

## Yerel calistirma

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Alpha auth

Uygulamada gecici "Giris / kayit" akisi kaldirildi. Yerine iki secenek var:

- Oturum Ac
- Hesap Olustur

Alpha surum GitHub Pages uzerinde statik calistigi icin hesaplar localStorage icinde saklanir. Sifreler duz metin olarak tutulmaz; tarayicinin Web Crypto API'si ile salt kullanilarak hashlenir.

Saklanan hesap alani:

- `id`
- `username`
- `email`
- `passwordHash`
- `passwordSalt`
- `createdAt`

Not: Bu yapi alpha/demo icindir. Production icin Supabase Auth veya backend tarafli auth kullanilmalidir. Supabase profil ve gunluk takip semasi `docs/supabase-health-tracking-schema.sql` dosyasindadir.

## Saglik profili ve gunluk takip

Hesap olusturan kullanici once onboarding ekranina yonlenir. Bu akista:

- Profil Bilgileri
- Saglik bilgileri
- Hedefler
- Gunluk Takip baslangic verileri

toplanir. Dashboard uzerinde BMI, BMI kategorisi, hedef kiloya kalan fark, su/adim/uyku ilerlemesi, tahmini kalori ihtiyaci ve ideal kilo araligi dinamik hesaplanir.

Production Supabase entegrasyonu icin:

1. Supabase projesinde Auth > Providers icinden e-posta girisini etkinlestir.
2. SQL editor icinde `docs/supabase-health-tracking-schema.sql` dosyasini calistir.
3. Frontend tarafinda local auth servisini Supabase `signUp`, `signInWithPassword`, `signOut` ve `onAuthStateChange` akisi ile degistir.
4. `profiles` ve `daily_logs` sorgularinda `user_id = session.user.id` kullan.

## Diyetisyen rolu

Kayit ekraninda hesap turu `Normal Kullanici` veya `Diyetisyen` olarak secilebilir. Diyetisyen hesabi giris yaptiginda kullanici dashboard'u yerine diyetisyen paneline yonlenir.

Diyetisyen panelinde:

- Dashboard
- Danisanlar
- Danisan detayi
- Danisan notlari
- Beslenme planlari
- Haftalik kontroller

bulunur. Alpha surumde danisan eklemek icin once normal kullanici hesabi olusturulur, sonra diyetisyen hesabinda `Danisanlar` ekranindan kullanici adi veya e-posta ile danisan listesine eklenir.

Supabase migration dosyasi su tablolari ve RLS policy'lerini icerir:

- `profiles`
- `daily_logs`
- `dietitian_patients`
- `dietitian_notes`
- `meal_plans`
- `meal_plan_items`
- `weekly_checkins`

## Admin paneli

Admin rolu kayit ekraninda gosterilmez. Alpha surumde gizli admin girisi vardir; belirlenen admin kullanici adi ve sifresiyle oturum acildiginda `/admin` paneline yonlenir. Production surumde admin yetkisi sadece Supabase SQL editor veya guvenli backend tarafindan verilmelidir.

Admin paneli:

- `/admin` route'u sadece `role = admin` icin acilir.
- Normal kullanici ve diyetisyen admin route'una erisemez.
- Admin menusu sadece admin oturumunda gorunur.
- Admin kullanici rollerini gorebilir ve degistirebilir.

## GitHub Pages alpha yayin

1. GitHub'da yeni bir repo olustur.
2. Bu klasoru repo olarak baslat:

```bash
git init
git add .
git commit -m "Alpha release"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

3. GitHub repo sayfasinda `Settings > Pages` bolumune git.
4. `Build and deployment` icin `Source: GitHub Actions` sec.
5. `Actions` sekmesinde `Deploy Alpha To GitHub Pages` calistiktan sonra alpha URL hazir olur.

Kullanici sitesi icin repo adi `KULLANICI_ADI.github.io` olursa adres `https://KULLANICI_ADI.github.io` olur.
Normal proje reposu icin adres `https://KULLANICI_ADI.github.io/REPO_ADI/` olur.
