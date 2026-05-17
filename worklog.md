---
Task ID: 0
Agent: main
Task: Project initialization and full build of Premies Portal

Work Log:
- Initialized Next.js 16 project with App Router + TypeScript strict mode
- Configured ActivBank Design System with CSS custom properties (Tailwind CSS 4)
- Built Layout: Sidebar (role-based, collapsible, mobile sheet), Header (breadcrumbs, user dropdown), PageContainer
- Implemented Auth system: Zustand store with login/logout, V2 token exchange, auto-logout 30min, cookie/localStorage persistence
- Created all 6 API services: auth, agent, back-office, processing, products, analytics
- Built banking UI Kit: DataTable (TanStack Table v8), StatusBadge, KPICard, MiniChart
- Built 21 feature pages across 6 role groups with mock data
- Integrated auth gate: login page with demo accounts → portal layout
- All pages lazy-loaded with Suspense boundaries
- ESLint: 0 errors, 1 pre-existing warning

Stage Summary:
- Complete Premies Portal banking application with 20+ pages
- Auth flow with 3 demo roles (Председатель, Агент, Фронтовик)
- Role-based sidebar navigation with 6 groups
- All pages fully functional with mock data, charts, tables, and forms
- Design system matches ActivBank branding (bank-red #C8102E, coal, surface, background)
