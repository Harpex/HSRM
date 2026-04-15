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
