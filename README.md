# TopFind

Yo'qolgan va topilgan buyumlar uchun Angular va Express ilovasi.

## Ishga tushirish

Backend uchun PostgreSQL bazasini yarating. `backend-nodejs/.env.example` faylini `.env` sifatida nusxalang va baza hamda JWT sozlamalarini kiriting. Mavjud `.env` faylingiz bo'lsa, uni saqlang.

```sh
cd backend-nodejs
npm install
npm run db:init
npm run dev
```

Boshqa terminalda frontendni ishga tushiring:

```sh
cd frontend-angular
npm install
npm start
```

Brauzer: http://localhost:4200. Backend: http://localhost:3000. Angular proksi `/api` va `/uploads` so'rovlarini backendga yuboradi.

Development rejimida SMTP sozlanmagan bo'lsa, OTP backend terminali va API javobida ko'rinadi. Haqiqiy email jo'natish uchun SMTP sozlamalarini to'ldiring. Production rejimida `NODE_ENV=production` bo'lishi va SMTP ishlashi kerak.

## Tekshirish

```sh
cd backend-nodejs
npm test
```

API testi PostgreSQL va bazadagi sxemani talab qiladi. Test alohida vaqtinchalik foydalanuvchilar va e'lonlar yaratadi, yakunda ularni tozalaydi. Email jo'natmaydi. Alohida test bazasidan foydalanish mumkin.

```sh
cd frontend-angular
npm test
npm run build
```

Frontend `npm test` TypeScript va Angular shablonlarini tekshiradi. Brauzer tekshiruvi uchun ikkala serverni ishga tushiring va loyiha ildizida `node check-browser.cjs` buyrug'ini bajaring. Buning uchun Playwright va Microsoft Edge kerak. Playwright boshqa joyda o'rnatilgan bo'lsa, `PLAYWRIGHT_PATH` muhit o'zgaruvchisida uning paket yo'lini ko'rsating.

Brauzer testi 16 sahifani 4 ekran o'lchamida tekshiradi, login hamda e'lon yaratish, tahrirlash va yopish amallarini bajaradi. Test rasmlari `artifacts` papkasiga saqlanadi.
