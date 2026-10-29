<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img alt="Anderson Neto, Full-Stack Developer, Lisbon" src="assets/header-light.svg" width="100%">
</picture>

I build web products end to end: interfaces in React and Next.js, APIs in Node.js, NestJS and FastAPI, relational data models, payments, real-time features and the CI that keeps them working. Most of what I ship runs in production for real users.

[Portfolio](https://andersonneto.gt.tc) · [LinkedIn](https://linkedin.com/in/anderson-fullstack-developer) · [Email](mailto:andersonneto.dev.fullstack@gmail.com)

## In production

**Brand22 CRM.** The internal CRM of Brand22 Creative Agency: kanban sales pipeline, leads, tasks with staff/admin review and a token-based client portal for project approval. Leads from the agency's WordPress site arrive through a webhook, and a scheduled job sends proposal follow-ups.
<br><sub>React · TanStack Start · TypeScript · serverless API on Vercel · MySQL · Resend · private repository</sub>

**AI virtual assistants for public-sector websites.** Assistants for [CIMAT](https://cimat.pt/) and AMAT, and the Brand22 website chatbot. The widget talks to a WordPress REST route in PHP, so the model API key never reaches the browser.
<br><sub>JavaScript · PHP · WordPress REST API · Claude API</sub>

## Selected projects

| Project | What it is | Engineering highlights |
|---|---|---|
| **[Fala Neto](https://github.com/anderson-fullstack-developer/app_stp)** | Language-learning app with a real-time multiplayer arena | Turborepo monorepo (Expo, NestJS, TanStack Start); server-authoritative game rules in a pure, shared package; content review workflow with audit log; 114 tests in CI |
| **[Garimpo](https://github.com/anderson-fullstack-developer/vinted)** | Multi-user SaaS that turns new Vinted listings into Telegram alerts | FastAPI background monitor that batches searches and backs off on rate limits; per-alert deduplication; rotating refresh tokens; Stripe billing; 200 Pytest tests in CI |
| **[STP Market](https://github.com/anderson-fullstack-developer/ecommerce-marketplace)** | Multi-vendor marketplace with vendor approval and commissions | Prices recalculated on the server at checkout; idempotent Stripe webhook; stock decremented only after payment; Clerk for customers and Auth.js for staff in one middleware |
| **[App Transfer](https://github.com/anderson-fullstack-developer/app_transfer)** | Family-to-student money transfers (simulation mode) | Modular monolith in NestJS; explicit transfer state machine; idempotency keys; decimal-safe money maths; integration tests against a real PostgreSQL in CI |
| **[ScreenRoom](https://github.com/anderson-fullstack-developer/app_screm)** | Real-time screen sharing in private rooms | WebRTC through a LiveKit SFU, so media never touches the app server; centralised permission layer; Redis rate limiting; Vitest and Playwright |
| **[RHNeto Pro](https://github.com/anderson-fullstack-developer/rhneto-pro)** | Restaurant staff management: panel and employee app | Two interfaces on one MySQL schema; request/approval flow for clock entries, tips and holidays; immutable payroll once a month is closed; Stripe subscriptions and SMS |

## How I work

- **The server decides.** Prices, scores, permissions and state transitions are computed and validated on the server, never trusted from the client.
- **Payments and side effects are idempotent.** Webhooks and retries cannot create duplicate orders or transfers.
- **Tests and CI from the first module.** Type checking, linting, unit and integration tests run on every push.
- **Secrets stay out of code and out of the browser.** Configuration is validated at startup, and production refuses to start with unsafe settings.
- **Documentation is part of the work.** Each repository explains its architecture, decisions and how to run it.

## Stack

**Languages:** TypeScript, JavaScript, Python, PHP, SQL  
**Front-end:** React, Next.js, TanStack Start, React Native (Expo), Tailwind CSS  
**Back-end:** Node.js, NestJS, Express, FastAPI, REST, WebSockets (Socket.IO)  
**Data:** PostgreSQL, MySQL, Prisma, Drizzle, SQLAlchemy, Redis  
**Platform:** Docker, GitHub Actions, Vercel, Railway, Neon, Stripe

<sub>Open to full-stack roles in Portugal and remote.</sub>
