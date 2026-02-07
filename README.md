# Kairo - GP Practice Management System

A modern, web-based GP Practice Management System built for UK general practices.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **React Query** - Data fetching and caching
- **Zustand** - State management

### Backend
- **NestJS** - Node.js framework with TypeScript
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication

## Project Structure

```
kairo/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Shared types, constants, utilities
│   ├── database/     # Prisma schema and migrations
│   └── ui/           # Shared UI components (optional)
├── turbo.json        # Turborepo config
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kairo.git
cd kairo
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. Set up the database:
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Or run migrations (production)
pnpm --filter @kairo/database db:migrate
```

5. Start the development servers:
```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Features

### Implemented
- **Dashboard** - Overview stats, today's appointments, quick actions
- **Appointments** - Calendar view (day/week/month), list view, booking
- **Patients** - Patient list, search, registration, profile
- **Staff** - Staff management, working hours, roles
- **Practice Settings** - Practice details, opening hours, appointment types
- **Forms** - Clinical forms and templates library

### Planned
- Consultations / Clinical notes
- Prescriptions (acute and repeat)
- Test results and documents
- Referrals
- Patient portal
- SMS/Email notifications
- Reporting and analytics

## Module Overview

### Dashboard
- Key statistics (patients, appointments, DNAs, cancellations)
- Today's appointments list
- Quick action buttons
- Pending tasks (test results, documents, prescriptions)

### Appointments
- Interactive calendar (day/week/month views)
- Appointment filtering by clinician, type, status
- Quick booking modal
- Status management (check-in, start, complete, DNA, cancel)

### Patients
- Searchable patient list
- Patient registration wizard
- Patient profile with:
  - Demographics
  - Alerts (allergies, safeguarding)
  - Medical history
  - Recent appointments
  - Documents

### Staff
- Staff directory with role badges
- Working hours management
- Digital signature capture
- License number tracking (GMC/NMC)

### Settings
- Practice details (name, address, ODS code)
- Opening hours configuration
- Appointment type settings
- Notification preferences

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user

### Patients
- `GET /api/patients` - List patients
- `GET /api/patients/:id` - Get patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient

### Appointments
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/check-in` - Check in patient
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Staff
- `GET /api/staff` - List staff
- `GET /api/staff/clinicians` - List clinicians
- `PUT /api/staff/:id/working-hours` - Update working hours

### Practice
- `GET /api/practices/current` - Get practice details
- `PUT /api/practices/current` - Update practice
- `PUT /api/practices/current/opening-hours` - Update hours

## Database Schema

The database uses PostgreSQL with Prisma ORM. Key models:

- **Practice** - Multi-tenant practice details
- **User** - Staff members with roles
- **Patient** - Patient records
- **Appointment** - Scheduled appointments
- **Consultation** - Clinical notes
- **Prescription** - Prescriptions
- **Document** - Uploaded files

## License

Private - All rights reserved.
