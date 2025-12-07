# Open School Portal — Frontend

Open School Portal is a modern, high-performance school management frontend built with **Next.js**, **TypeScript**, **TailwindCSS**, **Framer Motion**, **TanStack Query**, **Zod**, and **ShadCN UI**. Each school runs on its own dedicated instance for privacy, customization, and smooth experiences across Admins, Teachers, Students, and Parents.

## Why it matters
- Replaces paper-based attendance, grading, timetables, fees, and communications with fast digital workflows.
- Gives every school a private, customizable deployment for stronger data privacy and flexibility.
- Delivers real-time visibility to admins, teachers, students, and parents with audit-ready accuracy.

---

## Overview
The Open School Portal replaces paper-based workflows with a fast, secure, mobile-first digital system. Administrators manage operations, teachers track attendance and results, parents stay updated in real time, and students access schedules and grades in one place.

Unlike traditional SaaS solutions, the platform is deployed per school, offering:
- Full data privacy and isolation
- Customization for each institution
- Flexible scaling
- A personalized user experience for all roles

---

## Tech Stack
### Core Technologies
- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **ShadCN UI**
- **Framer Motion**
- **TanStack Query**
- **Zustand**
- **Zod**
- **pnpm** (package manager)

### Additional Tools
- Axios
- ESLint + Prettier
- Husky + Lint-Staged
- Commitlint

---

## Repository Structure
```
open-school-portal-frontend/
├── src/
│   ├── app/                     # Next.js app router
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (portal)/            # Main portal pages (admin, teacher, student, parent)
│   │   ├── (external)/          # External facing pages
│   │   ├── (squeeze)/           # Squeeze pages
│   │   ├── api/                 # API route handlers
│   │   └── ...
│   ├── components/              # Shared and UI components
│   │   ├── ui/                  # ShadCN UI components
│   │   └── ...
│   ├── lib/                     # Libraries and utilities
│   ├── store/                   # State management (Zustand)
│   ├── hooks/                   # Custom hooks
│   ├── services/                # Service layer
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   ├── providers/               # Context providers
│   └── data/                    # Static data
├── public/                      # Static assets
├── package.json
├── next.config.ts
└── README.md
```

---

## Product Overview
The Open School Portal digitizes core school operations and centralizes communication among all stakeholders. The system handles:
- Attendance (manual + NFC teacher check-in)
- Fee invoicing and management
- Timetables and scheduling
- Result computation and reporting
- Real-time communication
- Analytics dashboards

The platform eliminates paper inefficiencies while providing real-time, reliable data for decision-making.

---

## Problem Statement
Schools face major workflow issues due to outdated processes:
- Manual attendance registers and grade books
- Disorganized communication
- Time-consuming fee reconciliation
- Lack of transparency for parents
- Students losing track of schedules and grades
- Administrators burdened by duplicate work and errors

Open School Portal solves these through a unified, digital ecosystem.

---

## Value Proposition
### For Administrators
- Digital workflows for attendance, fees, timetables, and results
- Real-time insights and analytics
- Audit logs and accurate historical data

### For Teachers
- NFC-powered attendance
- Automated result computation
- Organized class and subject management

### For Parents
- Access to performance, attendance, and fee history
- Real-time school updates

### For Students
- Timetable access
- Comprehensive grade history
- Organized academic updates

---

## Goals and Objectives
- Digitize and streamline all school operations
- Provide each school with a private, customizable platform
- Strengthen communication among teachers, parents, admin, and students
- Reduce staff workload and eliminate redundancy
- Improve data accuracy and data-driven decision-making
- Ensure security, scalability, and reliability

---

## Competitor Summary
Open School Portal stands out through:
- Dedicated deployed instance per school
- Mobile-first approach
- NFC attendance integration
- Comprehensive all-in-one feature set

Compared to traditional systems like PowerSchool or QuickSchools, it offers better customization and privacy at a more accessible scale.

---

## Core Features
### Administration
- Create and manage classes and sessions
- Enroll students and assign teachers
- Manage fees, invoices, and payment tracking
- Approve results
- Monitor dashboards and analytics

### Teachers
- NFC attendance check-in
- Student attendance
- Grade entry and result sheet generation
- Timetable view

### Parents
- Child attendance
- Fee invoices and payments
- Result sheets
- Notifications

### Students
- Timetables
- Results and performance history
- School updates

---

## Functional Requirements (Summary)
### Admin
- Register school and admin account
- Login and password recovery
- Manage fees, results, classes, and teachers

### Teacher
- NFC attendance check-in
- Enter grades and attendance
- Access timetable and class data

### Parent
- View attendance, results, and invoices
- Download report sheets

### Student
- View timetable
- View term results and updates

---

## Non-Functional Requirements
- **Performance:** Dashboard under 2 seconds; attendance under 1 second
- **Scalability:** Supports 200 to 5,000+ students
- **Security:**
  - Role-based access control
  - Encrypted data
  - POPIA-compliant storage
  - Audit trail
- **Usability:** Mobile-first, intuitive UI

---

## Success Metrics
- Lower attendance and grading errors
- Increased parent engagement
- Reduced fee reconciliation disputes
- Faster admin workflows and reduced manual work

---

## Getting Started
### 1. Clone repository
```bash
git clone https://github.com/<org>/open-school-portal-frontend.git
cd open-school-portal-frontend
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Start development server
```bash
pnpm dev
```

Application will be available at:
```
http://localhost:3000
```

---

## Development Standards
* TypeScript-first development
* Zod for runtime schema validation
* TanStack Query for API caching and async state
* ShadCN UI for consistent components
* Conventional Commits for commit messages
* Linting/formatting enforced with ESLint, Prettier, Husky, and Lint-Staged

---

## Target Users
* School Administrators
* Teachers
* Parents
* Students
