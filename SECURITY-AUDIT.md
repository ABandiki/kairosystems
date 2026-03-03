# Kairo Security Audit Report

**Date:** 2026-03-03
**Scope:** Full backend API + frontend architecture
**Commits:** `395d141` (initial security hardening) + `9d8ea58` (complete validation coverage)

---

## 1. ARCHITECTURE: BACKEND-ONLY DATA ACCESS

| Check | Status | Detail |
|-------|--------|--------|
| Frontend never imports Prisma/DB SDK | PASS | Zero `prisma`, `PrismaClient`, or DB SDK imports in `apps/web/src/` |
| Frontend never calls DB directly | PASS | All data flows through `lib/api.ts` → `apiFetch()` → `/api/*` endpoints |
| No service_role / DB credentials in frontend | PASS | Only `NEXT_PUBLIC_API_URL` exposed; no DB connection strings |
| Frontend package.json has no DB dependencies | PASS | Only React/Next.js ecosystem packages |

## 2. AUTHENTICATION & AUTHORIZATION

| Check | Status | Detail |
|-------|--------|--------|
| All business controllers use `@UseGuards(JwtAuthGuard)` | PASS | 15 controllers at class level; auth/onboarding/demo-requests use method-level guards for public endpoints |
| Super admin endpoints use `@Roles('SUPER_ADMIN')` | PASS | All 18 super-admin guarded endpoints use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('SUPER_ADMIN')` |
| `practiceId` extracted from JWT token only | PASS | All business endpoints use `req.user.practiceId` — never from request body/params |
| JWT_SECRET has no hardcoded fallback | PASS | Uses `configService.getOrThrow('JWT_SECRET')` in both `auth.module.ts` and `jwt.strategy.ts` |

### Intentionally Public Endpoints (All Rate-Limited)
- `POST /auth/login` — 5/15min
- `POST /auth/forgot-password` — 3/hour
- `POST /auth/reset-password` — 5/15min
- `POST /onboarding/register-practice` — 3/hour
- `POST /onboarding/request-device` — 5/15min
- `GET /onboarding/check-device` — 10/min
- `GET /onboarding/practice-lookup` — 5/15min
- `POST /demo-requests` — 3/hour
- `POST /super-admin/login` — 5/15min

## 3. INPUT VALIDATION

| Check | Status | Detail |
|-------|--------|--------|
| Zero `@Body() data: any` in codebase | PASS | Verified with grep — zero matches |
| Zero inline `@Body() data: { ... }` types | PASS | All replaced with class-validator DTOs |
| `ValidationPipe` with `whitelist: true` | PASS | Unknown properties stripped from all requests |
| `forbidNonWhitelisted: true` | PASS | Requests with unknown properties return 400 |
| `transform: true` enabled | PASS | Auto-transforms payloads to DTO class instances |

### DTO Coverage (Complete)
| Module | DTOs Created | Endpoints Covered |
|--------|-------------|-------------------|
| patients | 4 | create, update, alert, medical history |
| appointments | 1 | create |
| notes | 2 | create, update |
| invoices | 3 | create, update, billing PIN |
| prescriptions | 2 | create, update |
| documents | 2 | create, update |
| staff | 4 | create, update, working hours, signature |
| form-templates | 2 | create, update |
| form-submissions | 2 | create, update |
| practices | 6 | update, opening hours, pharmacy, room, appointment types (create + update) |
| super-admin | 12 | login, create admin/staff, notifications, subscription, status, bulk ops, device revoke, staff update/reset |
| onboarding | 2 | register practice, request device |
| messaging | 3 | send message, create/update template |
| demo-requests | 2 | submit, update |
| devices | 2 | register, revoke |
| auth | 1 | login (pre-existing) |
| **Total** | **~50 DTOs** | **All mutation endpoints** |

## 4. ERROR HANDLING & LOGGING

| Check | Status | Detail |
|-------|--------|--------|
| Global exception filter | PASS | `GlobalExceptionFilter` in `common/filters/http-exception.filter.ts` |
| Production error obfuscation | PASS | 500 errors return generic "Internal server error" in production |
| Prisma error mapping | PASS | P2002→409, P2025→404, P2003→400 |
| Audit logging interceptor | PASS | `LoggingInterceptor` logs `{method} {path} {status} {duration}ms [user:{id}]` |
| No PII in logs | PASS | Only IDs and status codes logged — no emails, phones, or request bodies |
| try/catch on all routes | PASS | Global filter catches all unhandled exceptions |

## 5. ENVIRONMENT & CONFIGURATION

| Check | Status | Detail |
|-------|--------|--------|
| Env validation at startup | PASS | `validateEnv()` runs before `NestFactory.create()` |
| JWT_SECRET required | PASS | App refuses to start without it |
| DATABASE_URL required | PASS | Validated in `env.validation.ts` |
| CORS_ORIGIN required in production | PASS | Checked when `NODE_ENV=production` |
| Weak JWT_SECRET blocked in production | PASS | Rejects secrets shorter than 32 chars in production |
| Swagger disabled in production | PASS | Only mounted when `NODE_ENV !== 'production'` |
| No hardcoded secrets in code | PASS | All secrets via `process.env` |

## 6. RATE LIMITING

| Check | Status | Detail |
|-------|--------|--------|
| Global rate limit | PASS | 60 requests / 60 seconds via `ThrottlerModule` |
| Auth login throttled | PASS | 5 per 15 minutes |
| Super admin login throttled | PASS | 5 per 15 minutes |
| Forgot password throttled | PASS | 3 per hour |
| Onboarding registration throttled | PASS | 3 per hour |
| Demo request submission throttled | PASS | 3 per hour |

## 7. SECURITY HEADERS & MIDDLEWARE

| Check | Status | Detail |
|-------|--------|--------|
| Helmet enabled | PASS | Sets X-Frame-Options, X-Content-Type-Options, HSTS, etc. |
| CORS restricted | PASS | Only configured origin allowed, credentials: true |
| Allowed methods explicit | PASS | GET, POST, PUT, DELETE, PATCH only |
| Allowed headers explicit | PASS | Content-Type, Authorization, X-Device-Fingerprint only |
| Password hashing | PASS | bcrypt with salt rounds = 10 |
| Device fingerprint system | PASS | Device registration, approval, and revocation workflow |
| Trial guard | PASS | Global guard blocks expired trial practices |
| Tier guard | PASS | Premium features gated by subscription tier |

## 8. KNOWN LIMITATIONS & RECOMMENDATIONS

### Items NOT in scope (acceptable for current stage)
- **@Query() parameter validation**: Query params (search, pagination, filters) are not validated via DTOs. They're read-only and passed to Prisma's `where` clause which handles type safety. Low risk.
- **@Param('id') UUID validation**: Route params aren't validated as UUIDs. Invalid IDs simply return 404 from Prisma. Low risk.
- **Storage/file uploads**: No file upload endpoints currently exist. When added, implement signed URLs and random filenames.
- **Webhook signature verification**: No payment webhooks currently. When Stripe is added, implement `constructEvent` verification.

### Architecture Decisions
- **Prisma as ORM**: Acts as the authorization layer — every query scopes by `practiceId` from JWT. This replaces traditional RLS since there's no direct DB access from frontend.
- **NestJS global pipes**: `ValidationPipe` with whitelist + forbidNonWhitelisted provides framework-level input sanitization — no manual Zod needed.
- **class-validator decorators**: Type-safe, declarative validation that generates Swagger docs automatically.

---

## COMPLIANCE CHECKLIST

- [x] Architecture: Frontend NEVER talks to Database directly
- [x] Auth: JWT authentication on all non-public endpoints
- [x] Authorization: practiceId from token, role guards, tier guards
- [x] Input validation: Every @Body() has class-validator DTO
- [x] Error obfuscation: Production returns generic errors only
- [x] Audit logging: All requests logged with userId and timing
- [x] No hardcoded secrets: Env validation enforces at startup
- [x] Rate limiting: All auth/mutation endpoints throttled
- [x] Security headers: Helmet middleware enabled
- [x] CORS: Restricted to configured origin only
- [x] Swagger: Disabled in production
- [x] Password security: bcrypt hashing, strength validation on all password DTOs
