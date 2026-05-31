# PrivacyShield AI

Privacy-first surveillance workflow with real image/video upload, automatic face blurring, protected media review, access requests, admin approvals, audit logs, and user listing.

## Local setup

Install backend packages:

```powershell
cd backend\server
npm install
```

Install AI processing packages:

```powershell
cd backend\ai-processing
py -3 -m pip install -r requirements.txt
```

Install frontend packages:

```powershell
cd frontend
npm install
```

## Run locally

Start the backend:

```powershell
cd backend\server
npm run dev
```

Start the frontend:

```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000`.

Default local accounts are created automatically when the local JSON store is first used:

```text
admin@privacyshield.local / admin123
officer@privacyshield.local / officer123
```

Override them with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `OFFICER_EMAIL`, `OFFICER_PASSWORD`, and `OFFICER_NAME` in `backend/server/.env`.

## Storage

By default the app uses local JSON and local uploaded files so the upload and blur workflow works immediately.

To use Supabase instead, set:

```env
STORAGE_PROVIDER=supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

The backend expects `documents`, `access_requests`, `audit_logs`, and `users` tables, plus a `documents` storage bucket.

## Verification

Frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Backend syntax check:

```powershell
cd backend\server
node --check src\app.js
```
