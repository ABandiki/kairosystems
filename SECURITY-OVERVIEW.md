# Kairo Systems — Security Overview

**Document Version:** 1.0
**Last Updated:** 2 March 2026
**Classification:** Public

---

## Executive Summary

Kairo is a cloud-based practice management system designed for healthcare providers. We understand that patient data is among the most sensitive information that exists, and we've built our platform with security as a foundational requirement — not an afterthought.

This document outlines the security measures, controls, and practices in place to protect your practice and patient data.

---

## 1. Infrastructure Security

### 1.1 Hosting & Network Architecture

- **Cloud Provider:** DigitalOcean (ISO 27001, SOC 2 Type II certified data centres)
- **Architecture:** All services run behind a reverse proxy with no direct internet exposure to application or database services
- **Firewall:** Server-level firewall (UFW) restricts access to only essential ports (HTTP, HTTPS, SSH)
- **Network Isolation:** Application services, database, and web frontend run in isolated Docker containers on a private network. Only the reverse proxy is internet-facing

```
Internet → Firewall → Nginx Reverse Proxy → Internal Services Only
```

### 1.2 Encryption

| Layer | Standard |
|-------|----------|
| Data in Transit | TLS 1.2 / TLS 1.3 (HTTPS enforced) |
| SSL Certificates | Let's Encrypt (auto-renewed) |
| HTTP Requests | Automatically redirected to HTTPS |
| Passwords | bcrypt hashing (10-12 salt rounds) |
| Sensitive PINs | bcrypt hashing |

All communication between your browser and Kairo is encrypted. We enforce HTTPS with HTTP Strict Transport Security (HSTS), ensuring browsers always connect securely.

### 1.3 Security Headers

Our application implements comprehensive HTTP security headers:

| Header | Protection |
|--------|-----------|
| Content-Security-Policy | Prevents cross-site scripting (XSS) and data injection |
| X-Frame-Options: DENY | Prevents clickjacking attacks |
| X-Content-Type-Options: nosniff | Prevents MIME-type confusion attacks |
| Strict-Transport-Security | Forces HTTPS connections |
| X-XSS-Protection | Additional XSS filtering |
| Referrer-Policy | Controls information sent in referrer headers |
| Permissions-Policy | Restricts browser API access (camera, microphone, geolocation disabled) |

---

## 2. Application Security

### 2.1 Authentication

- **Password Hashing:** All passwords are hashed using bcrypt with 10-12 salt rounds. We never store passwords in plain text or reversible encoding
- **Password Requirements:** Minimum 8 characters with mandatory uppercase, lowercase, and numeric characters
- **JWT Authentication:** Secure JSON Web Tokens for session management with configurable expiry
- **Role-Based Access Control (RBAC):** Granular permissions based on user roles (Practice Admin, Doctor, Nurse, Receptionist, Practice Manager)

### 2.2 Rate Limiting & Brute Force Protection

All authentication endpoints are protected with rate limiting to prevent brute force attacks:

| Endpoint | Limit |
|----------|-------|
| Login | 5 attempts per 15 minutes |
| Forgot Password | 3 attempts per hour |
| Reset Password | 5 attempts per 15 minutes |
| Change Password | 5 attempts per 15 minutes |
| Practice Registration | 3 per hour |
| Global API | 30 requests per minute per IP |

### 2.3 API Security

- **No Public API Documentation:** API documentation (Swagger) is disabled in production
- **Input Validation:** All API inputs are validated and sanitised using class-validator decorators
- **CORS Policy:** Strict Cross-Origin Resource Sharing allowing only the Kairo web application domain
- **Helmet Middleware:** Industry-standard security middleware protecting against common web vulnerabilities

### 2.4 Multi-Tenancy

- **Practice Isolation:** Each practice's data is completely isolated. All database queries are scoped to the authenticated user's practice
- **Staff Permissions:** Practice admins control who can access their practice, with role-based permissions for different staff members
- **Device Management:** Practices can approve or revoke access for specific devices

---

## 3. Data Protection

### 3.1 Database Security

- **No Direct Access:** The database is not accessible from the internet. It runs on an isolated Docker network accessible only to the application service
- **Defence in Depth:** Even if the firewall were bypassed, the database port is not exposed on the host
- **Backups:** Regular database backups (configurable by hosting provider)
- **Connection Security:** Database connections are restricted to internal Docker network only

### 3.2 Data Handling

- **No Data Sharing:** We do not sell, share, or provide patient data to third parties
- **Data Minimisation:** We only collect data necessary for practice management functions
- **Audit Trail:** All significant actions (logins, data changes, messaging) are logged with timestamps and user identification
- **Message Logging:** All patient communications (email, SMS, WhatsApp) are logged for audit purposes with delivery status tracking

### 3.3 Access Controls

| Role | Capabilities |
|------|-------------|
| Practice Admin | Full access to practice settings, staff management, billing, all patient data |
| Doctor / Clinician | Patient records, appointments, clinical notes, prescriptions |
| Nurse | Patient records, appointments, clinical notes |
| Receptionist | Appointments, patient demographics, billing |
| Practice Manager | Staff management, reports, billing |

Each role has precisely scoped permissions — staff members only see and modify what their role requires.

---

## 4. Communication Security

### 4.1 Patient Messaging

Kairo supports multi-channel patient communication:

- **Email:** Sent via SMTP with TLS encryption
- **SMS:** Sent via Twilio (SOC 2 Type II, ISO 27001 certified)
- **WhatsApp:** Sent via Twilio WhatsApp Business API (end-to-end encrypted by WhatsApp)

All messages are:
- Logged in the system with delivery status tracking
- Template-based to prevent accidental data exposure
- Only sendable by authenticated, authorised staff members
- Scoped to the practice's own patients only

### 4.2 Automated Notifications

Appointment reminders and confirmations are sent automatically via configured channels. Templates use variable placeholders (patient name, appointment time) — no clinical data is included in automated messages.

---

## 5. Operational Security

### 5.1 Server Access

- **SSH Key Authentication Only:** Password-based SSH login is disabled. Only authorised SSH keys can access the server
- **No Root Password:** Server access requires a cryptographic key, not a password
- **Access Logging:** All SSH connections are logged

### 5.2 Application Architecture

- **Containerised Deployment:** All services run in Docker containers with minimal base images (Alpine Linux)
- **Reverse Proxy:** Nginx handles SSL termination, request routing, and acts as a security gateway
- **No Exposed Ports:** Application and database ports are internal-only; all traffic routes through the reverse proxy

### 5.3 Dependency Management

- **Regular Updates:** Application dependencies are kept up to date
- **Minimal Attack Surface:** Production containers include only the files necessary to run the application

---

## 6. Compliance Considerations

While Kairo is not yet formally certified against specific healthcare compliance frameworks, our security controls align with the principles of:

- **Data Protection:** All patient data is encrypted, access-controlled, and isolated per practice
- **Access Control:** Role-based permissions with audit logging
- **Data Sovereignty:** Your data is stored on infrastructure you choose. We do not transfer data across jurisdictions without consent
- **Consent Management:** Built-in consent form templates and patient data processing agreements

---

## 7. Incident Response

In the event of a security incident:

1. **Detection:** Monitoring and logging systems alert on suspicious activity
2. **Containment:** Affected services can be isolated immediately via container management
3. **Notification:** Practice administrators will be notified of any incident affecting their data
4. **Remediation:** Root cause analysis and fix deployment
5. **Documentation:** Full incident documentation provided to affected parties

---

## 8. Continuous Improvement

Security is an ongoing process. Our roadmap includes:

- Two-factor authentication (2FA) for all user accounts
- CSRF token protection on all state-changing requests
- HttpOnly cookie-based session management
- Refresh token rotation with shorter access token expiry
- Server-side device fingerprinting
- Formal penetration testing
- SOC 2 Type II certification (planned)

---

## Contact

For security questions, vulnerability reports, or compliance inquiries:

- **Email:** security@kairo.clinic
- **Website:** https://kairo.clinic

---

*This document describes the security measures in place as of the date shown above. Security controls are continuously evaluated and improved.*
