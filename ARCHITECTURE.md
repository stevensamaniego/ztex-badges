# ZTEX Badges — Architecture

**Live Site:** https://ztex-badges.vercel.app
**Repo:** https://github.com/stevensamaniego/ztex-badges
**Local Dev:** `~/Projects/ztex-badges` (Mac mini)

## Stack

| Layer | Technology | Tier |
|-------|-----------|------|
| Frontend + Backend | Next.js 16 (App Router, TypeScript, Tailwind CSS) | — |
| Database | Neon Postgres (AWS us-east-1) | Free |
| Auth | NextAuth.js (credentials provider, JWT sessions) | — |
| Hosting | Vercel (serverless functions) | Free |
| Photos | Base64 in database | — |

## How It Works

```
User scans QR code on employee badge
        ↓
ztex-badges.vercel.app/employee/[id]
        ↓
Vercel serverless function (Next.js)
        ↓
Neon Postgres → fetches employee record
        ↓
Renders mobile-friendly employee page
  (photo or initials, name, title, authorizations, licenses)
```

## Where Things Live

| What | Where |
|------|-------|
| Source code | GitHub: `stevensamaniego/ztex-badges` |
| Database | Neon Postgres (via Vercel → Storage tab) |
| Hosting & deploys | Vercel (auto-deploys on `git push` to `main`) |
| Env vars (DB creds, auth secret) | Vercel → Settings → Environment Variables |
| Local dev copy | `~/Projects/ztex-badges` on the Mac mini |

## Making Changes

### Code Changes
Edit files locally, then:
```bash
cd ~/Projects/ztex-badges
git add -A && git commit -m "description" && git push
```
Vercel auto-deploys from GitHub within ~60 seconds.

### Direct Deploy (skip GitHub)
```bash
cd ~/Projects/ztex-badges
vercel --prod
```

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Push to Neon: `npx prisma db push`
3. Commit and push code

### Employee Data
All managed through the admin portal — no code changes needed.

## Admin Portal

- **URL:** https://ztex-badges.vercel.app/admin/login
- **Credentials:** `admin` / `ztex2026`
- **Features:** Add/edit/delete employees, upload photos, bulk CSV/Excel import, generate QR codes

## Key Files

```
prisma/schema.prisma                          # Database schema
lib/prisma.ts                                 # Database client
lib/auth.ts                                   # Auth configuration

app/(public)/employee/[id]/page.tsx           # Public badge page (QR target)
app/not-found.tsx                             # Branded 404

app/(admin)/admin/login/page.tsx              # Admin login
app/(admin)/admin/page.tsx                    # Admin dashboard
app/(admin)/admin/employees/new/page.tsx      # Add employee
app/(admin)/admin/employees/[id]/edit/page.tsx # Edit employee
app/(admin)/admin/import/page.tsx             # Bulk CSV/Excel import
app/(admin)/admin/qr-codes/page.tsx           # QR code generator

app/api/auth/[...nextauth]/route.ts           # Auth API
app/api/employees/route.ts                    # List & create employees
app/api/employees/[id]/route.ts               # Get, update, delete employee
app/api/employees/upload/route.ts             # Photo upload
app/api/employees/import/route.ts             # Bulk import
app/api/employees/qr/route.ts                # QR code generation

app/components/AdminNav.tsx                   # Admin navigation bar
app/components/EmployeeForm.tsx               # Add/edit form with photo upload
app/components/Toast.tsx                      # Toast notifications

public/images/ztex-logo-main.png              # ZTEX logo (Red/Yellow)
public/images/ztex-star.png                   # ZTEX star icon (favicon)
```

## Database Schema

```
Employee
  ├── id             (String, CUID, primary key)
  ├── employeeId     (String?, unique — for CSV matching)
  ├── fullName       (String)
  ├── title          (String)
  ├── photoUrl       (String? — base64 data URL)
  ├── authorizations (String — JSON array)
  ├── licenses       (String — JSON array)
  ├── createdAt      (DateTime)
  └── updatedAt      (DateTime)

User
  ├── id       (String, CUID, primary key)
  ├── username (String, unique)
  └── password (String, bcrypt hashed)
```

## Bulk Import Format

CSV or Excel with columns:
- `employee_id` — optional, used for matching existing records
- `full_name` — required
- `title` — required
- `authorizations` — semicolon-separated list
- `licenses` — semicolon-separated list

Delta logic: matches on `employee_id` → updates existing; new IDs → inserts; missing from file → unchanged (no deletes).

## Costs

| Service | Tier | Limits |
|---------|------|--------|
| Vercel | Free (Hobby) | 100GB bandwidth, serverless functions |
| Neon Postgres | Free | 0.5GB storage, 190 compute hours/month |
| **Total** | **$0/month** | More than enough for this use case |

## Local Development

```bash
cd ~/Projects/ztex-badges
vercel env pull .env.local    # Pull Vercel env vars for local dev
npm run dev                   # http://localhost:3000
```
