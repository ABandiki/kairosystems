# Kairo Systems - Technical Evaluation Document

**Document Version:** 1.0
**Last Updated:** 2 March 2026
**Classification:** Confidential - For Due Diligence / Evaluation Purposes

---

## 1. Executive Summary

Kairo is a cloud-based practice management system for private healthcare practices in Zimbabwe (expandable to other markets). It provides end-to-end clinic operations: appointment scheduling, patient records, clinical notes, prescriptions, billing, document management, and multi-channel patient communication (SMS, email, WhatsApp).

**Live URL:** https://kairo.clinic
**Status:** Production - live and operational
**Architecture:** Multi-tenant SaaS monorepo

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.1.0 |
| UI Framework | Tailwind CSS + shadcn/ui | Latest |
| State Management | Zustand + React Query | Latest |
| Backend | NestJS | 10.3.x |
| Language | TypeScript | 5.3.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15 (Alpine) |
| Authentication | JWT + NextAuth + Passport | - |
| Package Manager | pnpm | 8.15.0 |
| Monorepo Tooling | Turborepo | Latest |
| Containerisation | Docker + Docker Compose | - |
| Reverse Proxy | Nginx | Alpine |
| SSL | Let's Encrypt (auto-renew) | EC P-256 |
| SMS/WhatsApp | Twilio | 4.23.x |
| Email | Nodemailer (SMTP) | 6.9.x |

---

## 3. Architecture Overview

### 3.1 Monorepo Structure

```
kairo/
  apps/
    web/           Next.js 14 frontend (App Router, SSR)
    api/           NestJS backend (REST API)
  packages/
    database/      Prisma schema, migrations, seed data
    shared/        Shared types, constants, utilities
    ui/            Shared UI component library (placeholder)
```

### 3.2 Production Infrastructure

```
Internet
  |
  v
DigitalOcean Droplet (64.226.86.3)
  |
  +-- Nginx (ports 80, 443) -- SSL termination, rate limiting
       |
       +-- kairo-web   (port 3000, internal) -- Next.js SSR
       +-- kairo-api   (port 3001, internal) -- NestJS REST
       +-- kairo-db    (port 5432, internal) -- PostgreSQL
```

All services run in Docker containers on an isolated bridge network. Only Nginx is internet-facing. Database port is never exposed.

### 3.3 Multi-Tenancy Model

Practice-based isolation. Every database query is scoped to the authenticated user's `practiceId`. Users belong to exactly one practice. The `Practice` model holds subscription tier, trial status, and billing configuration.

---

## 4. Feature Inventory

### 4.1 Core Modules (21 API Modules)

| Module | Description | Status |
|--------|-------------|--------|
| **Appointments** | Calendar scheduling, status tracking, room allocation | Complete |
| **Patients** | Demographics, medical history, alerts, search | Complete |
| **Clinical Notes** | Consultation, follow-up, phone call, referral notes | Complete |
| **Prescriptions** | Acute and repeat prescriptions, medication management | Complete |
| **Billing/Invoices** | Invoice generation, line items, payment tracking, billing PIN | Complete |
| **Documents** | Medical document storage, categorisation, uploads | Complete |
| **Forms/Questionnaires** | Template builder, patient submissions, assessments | Complete |
| **Staff Management** | Directory, roles, working hours, permissions | Complete |
| **Dashboard** | KPI overview, appointment stats, revenue summary | Complete |
| **Messaging** | SMS, email, WhatsApp via Twilio; template management | Complete |
| **Notifications** | In-app alerts and notification system | Complete |
| **Auth** | JWT login, registration, password reset, role-based guards | Complete |
| **Practices** | Multi-tenant practice settings, subscription management | Complete |
| **Onboarding** | Practice setup wizard and initial configuration | Complete |
| **Demo Requests** | Lead capture for demo/trial signups | Complete |
| **Devices** | Device registration and approval for security | Complete |
| **Super Admin** | System-wide administration, practice oversight | Complete |

### 4.2 Frontend Pages

**Public (SEO-optimised):**
- Landing page with JSON-LD structured data
- Privacy policy, terms, DPA, patient consent form
- Brand preview

**Authentication:**
- Login, register, forgot password (noindex)
- Super admin login

**Dashboard (28+ pages):**
- Dashboard overview
- Appointments calendar/list
- Patient list + individual patient profiles
- Staff directory
- Clinical notes (list, create, view/edit)
- Prescriptions management
- Billing (list, create, view, edit invoices)
- Document management
- Messaging centre
- Forms (templates, builder, questionnaires, submissions)
- Reports and analytics
- Practice settings
- User profile

### 4.3 Integrations

| Integration | Provider | Purpose |
|-------------|----------|---------|
| SMS | Twilio | Appointment reminders, 2FA |
| WhatsApp | Twilio WhatsApp Business API | Patient communication |
| Email | Nodemailer (SMTP) | Notifications, password resets |
| SSL Certificates | Let's Encrypt + Certbot | Auto-renewed HTTPS |

---

## 5. Database Schema

**PostgreSQL 15** with **Prisma ORM**. 26 models across 6 domains:

### Core
- `Practice` - Multi-tenant practices with subscription tiers (STARTER/PROFESSIONAL/ENTERPRISE)
- `User` - Staff members with roles (SUPER_ADMIN, PRACTICE_ADMIN, GP, NURSE, HCA, RECEPTIONIST, PRACTICE_MANAGER)
- `Device` - Registered/approved devices
- `SuperAdmin` - System administrators (separate table)
- `SuperAdminActivityLog` - Admin audit trail

### Patient Management
- `Patient` - Full demographics, NHS number, alerts
- `PatientAlert` - Allergies, safeguarding, medical alerts
- `MedicalHistory` - Conditions, surgeries, family history

### Clinical
- `Appointment` + `AppointmentTypeSetting` - Scheduling with configurable types
- `Consultation` - Clinical consultation records
- `Note` - Multi-type clinical notes
- `Prescription` + `PrescriptionItem` - Medication management
- `Pharmacy` - Linked pharmacies
- `Room` - Consultation rooms
- `WorkingHours` + `OpeningHours` - Availability

### Documents & Forms
- `Document` - Uploaded medical documents
- `FormTemplate` - Questionnaire/survey builder
- `FormSubmission` - Patient responses

### Billing
- `Invoice` + `InvoiceItem` - Invoicing with line items

### Communication
- `MessageTemplate` - Reusable templates (email, SMS, WhatsApp)
- `MessageLog` - Delivery tracking and audit
- `Notification` - In-app notifications

---

## 6. Security Posture

Full details in `SECURITY-OVERVIEW.md`. Key highlights:

| Control | Implementation |
|---------|---------------|
| Encryption in transit | TLS 1.2/1.3 (HSTS enforced) |
| Password storage | bcrypt (10-12 rounds) |
| Authentication | JWT with configurable expiry |
| Authorisation | Role-based access control (7 roles) |
| Rate limiting | Per-endpoint (5/min login, 30/min API) |
| Network isolation | Docker bridge network, no exposed ports |
| Security headers | CSP, X-Frame-Options, HSTS, XSS Protection |
| Input validation | class-validator decorators on all endpoints |
| Multi-tenancy | Practice-scoped queries, no cross-tenant access |
| Audit logging | All significant actions logged |
| SSH access | Key-only authentication, no root password |
| API docs | Swagger disabled in production |

### Security Roadmap (Not Yet Implemented)
- Two-factor authentication (2FA)
- CSRF token protection
- HttpOnly cookie sessions
- Refresh token rotation
- Server-side device fingerprinting
- Formal penetration testing
- SOC 2 Type II certification

---

## 7. SEO & Online Presence

### Search Engine Optimisation (Implemented March 2026)
- Google Search Console verified and active
- `robots.txt` with crawl rules (blocks /dashboard, /api, /super-admin)
- `sitemap.xml` with 4 public pages (auto-generated, submitted to Google)
- JSON-LD structured data: SoftwareApplication, Organization, WebSite schemas
- Per-page metadata with titles, descriptions, canonical URLs
- Zimbabwe-focused keywords throughout
- Auth pages marked `noindex`
- www-to-non-www 301 redirect for SEO consolidation

### Social Media Accounts
| Platform | Handle/URL |
|----------|-----------|
| Instagram | [@kair.osystems](https://www.instagram.com/kair.osystems/) |
| X (Twitter) | [@kairosystems](https://x.com/kairosystems) |
| LinkedIn | [Kairo Clinic](https://www.linkedin.com/company/kairo-clinic/) |
| Facebook | [Kairo Systems](https://www.facebook.com/profile.php?id=61587922967714) |

---

## 8. Deployment & DevOps

### Production Environment
- **Provider:** DigitalOcean
- **Server:** Ubuntu droplet at 64.226.86.3
- **Domain:** kairo.clinic (SSL via Let's Encrypt, EC P-256)
- **Containers:** 4 Docker services (web, api, db, nginx)
- **Deployment:** Git pull + Docker Compose rebuild

### Deployment Process
```bash
ssh root@64.226.86.3
cd /root/kairo
git pull origin main
docker compose -f docker-compose.prod.yml build web api --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Configuration Files
| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production multi-service orchestration |
| `docker-compose.yml` | Development environment |
| `nginx/nginx.prod.conf` | Reverse proxy, SSL, rate limiting, security headers |
| `.env` / `.env.example` | Environment variables (DB, JWT, Twilio, SMTP) |
| `apps/api/Dockerfile` | API container build (multi-stage) |
| `apps/web/Dockerfile` | Web container build (multi-stage, standalone output) |
| `turbo.json` | Monorepo build pipeline |

---

## 9. Pricing Model (Configured)

| Tier | Price (USD/mo) | Target |
|------|---------------|--------|
| Starter | $49 | Solo practitioners, small clinics |
| Professional | $99 | Multi-doctor practices |
| Enterprise | Custom | Large medical groups |

Free trial: 2 days, no credit card required.

---

## 10. Codebase Metrics

| Metric | Value |
|--------|-------|
| Total API modules | 21 |
| Frontend pages | 28+ |
| Database models | 26 |
| User roles | 7 |
| Prisma schema | ~500 lines |
| Language | 100% TypeScript |
| Build system | Turborepo + pnpm workspaces |
| Test framework | Jest (configured) |

---

## 11. Legal & Compliance Documents

Available in `/legal files/`:
- Privacy Policy (live at /privacy-policy)
- Terms & Conditions (live at /terms)
- Data Processing Agreement (live at /data-processing-agreement)
- Patient Consent Form (live at /patient-consent-form)

---

## 12. Known Limitations & Technical Debt

1. **No automated tests** - Jest is configured but no test suites written yet
2. **No CI/CD pipeline** - Deployment is manual (git pull + docker rebuild)
3. **No file storage service** - Document uploads reference planned S3 integration
4. **No Redis caching** - Configured in .env but not implemented
5. **No 2FA** - On security roadmap
6. **No automated backups** - Database backup strategy needs implementation
7. **No monitoring/alerting** - No APM, uptime monitoring, or error tracking (e.g. Sentry)
8. **Single server** - No horizontal scaling, load balancing, or failover
9. **No rate limiting on WebSocket** - Only HTTP endpoints rate-limited

---

## 13. Growth Opportunities

1. **Geographic expansion** - Architecture supports any market; currently Zimbabwe-focused
2. **Mobile app** - API-first design enables native iOS/Android apps
3. **Telehealth** - Video consultation integration (WebRTC)
4. **Lab integrations** - HL7/FHIR standards for lab result ingestion
5. **Payment gateway** - Online payment processing for invoices
6. **AI features** - Clinical note summarisation, appointment prediction
7. **Marketplace** - Third-party integrations/plugins
8. **White-labelling** - Multi-brand deployment for resellers

---

*This document is intended for technical evaluation and due diligence purposes. All information is accurate as of the date shown above.*
