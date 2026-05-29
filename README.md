# HotelSurvey Web

HotelSurvey, oteller icin cok kiracili anket ve misafir geri bildirim panelinin ilk MVP iskeletidir.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Better Auth
- Prisma + PostgreSQL
- SurveyJS Creator / SurveyJS Form Library
- FastAPI entegrasyon sozlesmesi + stub istemci

## Ilk Kurulum

1. Bagimliliklari kur:

```bash
npm install
```

2. Ortam degiskenlerini hazirla:

```bash
cp .env.example .env
```

3. Prisma client uret:

```bash
npm run prisma:generate
```

4. Veritabani hazirsa schema push ve seed calistir:

```bash
npm run prisma:db-push
npm run prisma:seed
```

5. Uygulamayi baslat:

```bash
npm run dev
```

## Demo Bilgileri

Prisma seed calistiginda su demo kullanici olusur:

- Email: `admin@hospita.com`
- Sifre: `Hospita1234!`

## Komutlar

```bash
npm run dev
npm run lint
npm test
npm run build -- --webpack
npm run test:e2e
```

Notlar:

- Sandbox ortaminda `playwright` sunucuyu port acarak baslatamadigi icin `npm run test:e2e` burada calismayabilir.
- Varsayilan `HOTELSURVEY_API_STUB=true` ile public guest verify ve survey submit akisi stub olarak calisir.
- Better Auth icin uretimde daha uzun ve rastgele bir `BETTER_AUTH_SECRET` kullanilmalidir.

## Route Ozetleri

Admin:

- `/login`
- `/dashboard`
- `/forms`
- `/forms/new`
- `/forms/[formId]/settings`
- `/forms/[formId]/preview`
- `/forms/[formId]/publish`
- `/responses`
- `/responses/[responseId]`
- `/reports`
- `/team`
- `/settings`

Public:

- `/s/[publicSlug]`
- `/s/[publicSlug]/verify`
- `/s/[publicSlug]/start`
- `/s/[publicSlug]/thanks`
- `/s/[publicSlug]/invalid`
