// All site copy lives here. Edit this file; the components only render it.

export const profile = {
  name: "Wayan Candra Yoga Kamandanu",
  shortName: "Wayan Candra Yoga",
  role: "Full Stack Developer",
  location: "Jakarta, Indonesia",
  headline: "I build the backend systems and internal tools that teams rely on every day.",
  intro:
    "Informatics Engineering graduate working across Go, Laravel, React and Next.js. I build multi-tenant analytics backends, work on microservices and their gateways, tune them for memory and latency, and ship internal applications that business teams use directly.",
  email: "wayancandrayoga@gmail.com",
  github: "https://github.com/wynyga",
  linkedin: "https://www.linkedin.com/in/wayan-kamandanu-8a925621b/",
  // Set to a path under /public (e.g. "/Wayan_Candra_Yoga_Kamandanu_CV.pdf") to show a CV button.
  // Left empty on purpose: the PDF contains a phone number.
  cvUrl: "",
};

export const about = [
  "I'm a full stack developer based in Jakarta. I studied Informatics Engineering at Universitas Sam Ratulangi and graduated with a GPA of 3.64.",
  "Most of my work sits on the backend: Go services in clean architecture, distributed Laravel services behind Go gateways, event-driven processing with RabbitMQ, and Redis caching to keep response times down. I also build the interfaces on top, in Next.js and React, because the best internal tools come from owning the whole path from database to screen.",
  "At university I coordinated the SAR robot team in our robotics unit, designing an autonomous navigation robot for the Indonesian Robot Contest. Today I use personal projects to practise Go, clean architecture and containerised deployments.",
];

export const facts = [
  { label: "Currently", value: "Full Stack Developer, PT Aneka Search Indonesia" },
  { label: "Focus", value: "Analytics backends, distributed services, internal tools, performance" },
  { label: "Core stack", value: "Go · Laravel · React · Next.js · PostgreSQL · Redis" },
];

export type CaseStudy = {
  title: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
  /** A hosted demo that runs on sample data, when one exists. */
  demoUrl?: string;
  /** Built for internal use, so there is nothing public to link to. */
  internal?: boolean;
};

export type CompanyWork = {
  company: string;
  role: string;
  period: string;
  cases: CaseStudy[];
};

// Newest first. Each company's role and period head its block; cases are numbered per company by the page.
export const work: CompanyWork[] = [
  {
    company: "PT Aneka Search Indonesia",
    role: "Full Stack Developer",
    period: "Mar 2026 — Present",
    cases: [
      {
        internal: true,
        title: "Candidate analytics dashboards",
        kind: "Backend · Full stack · Data",
        summary:
          "Strategic Workforce Planning and Recruitment dashboards that more than 30 client companies use to follow their candidates' assessment results, served by one multi-tenant Go backend.",
        points: [
          "Go backend with a React TypeScript front end; each client is onboarded through its own catalog, SQL migrations and seed tooling instead of new code.",
          "Clean Architecture (domain, use case, adapters, composition root), guarded by architecture tests that fail when a layer imports a package it must not depend on.",
          "Cut the memory used to build a large client's candidate list from 499 MB to 15 MB by streaming rows, and added response caching and gzip to the polling endpoint.",
          "Cross-application SSO with ES256-signed JWTs so customers open the dashboards straight from their NUCLEUS client app, with separate writer and reader database connections.",
          "A versioned dataset cache and PostgreSQL queries tuned with EXPLAIN (ANALYZE, BUFFERS).",
          "Ported the Exam Monitor metrics module from PHP to Go and verified its output against the PHP version.",
          "Started as a React rebuild of a static mockup running on in-browser SQLite, then moved onto the Go backend as the client list grew.",
        ],
        stack: ["Go", "PostgreSQL", "React", "TypeScript", "JWT (ES256)"],
      },
      {
        internal: true,
        title: "Distributed assessment platform",
        kind: "Backend · Architecture",
        summary:
          "The core services behind an online assessment and recruitment product, split into independently deployable microservices.",
        points: [
          "Laravel microservices for candidate, content, tenant, interview and organisation domains.",
          "Contributed to the Nucleus Admin API gateway in Go (Gin): JWT authentication, routing to the Laravel core services, and request logs published asynchronously to RabbitMQ.",
          "Asynchronous event processing over RabbitMQ so slow work never blocks a request.",
          "Redis as a caching layer to cut response latency on hot reads.",
          "Everything containerised with Docker so development and production behave the same.",
        ],
        stack: ["Laravel", "Go", "Gin", "RabbitMQ", "Redis", "Docker"],
      },
      {
        internal: true,
        title: "Assessment support tools",
        kind: "Full stack · Internal product",
        summary:
          "An internal application the assessment team uses to generate and manage question banks, without engineering in the loop.",
        points: [
          "Question bank generation and management, built with Next.js on a Laravel API.",
          "An AI interview generation feature, built into the same workflow.",
          "A centralised audit log that records every data change made through the admin-role tools, with a viewer page so the team can trace who changed what.",
        ],
        stack: ["Next.js", "Laravel", "PostgreSQL", "TypeScript"],
      },
      {
        internal: true,
        title: "Participant spike monitoring",
        kind: "Observability · Dashboard",
        summary:
          "A dashboard that watches load on the online test platform so the team sees a surge of participants as it happens.",
        points: [
          "Real-time checks on concurrent test participants.",
          "Alerting built on Prometheus metrics, so spikes are flagged instead of discovered.",
        ],
        stack: ["Prometheus", "Alerting", "Real-time checks"],
      },
      {
        internal: true,
        title: "Client document portal",
        kind: "Full stack · Storage",
        summary:
          "A portal where client companies exchange files with the team, reworked so very large uploads and bulk downloads no longer fail.",
        points: [
          "Large files upload in chunks straight into S3 multipart uploads instead of passing through the app server in one piece.",
          "Bulk downloads stream as a ZIP, so the server never holds the whole archive in memory.",
        ],
        stack: ["Next.js", "Prisma", "AWS S3", "TypeScript"],
      },
    ],
  },
  {
    company: "PT Bumi Asih",
    role: "Full Stack Developer",
    period: "Jan 2024 — Jan 2026",
    cases: [
      {
        title: "SIMPRO (Sistem Informasi Properti)",
        kind: "Full stack · Digitisation",
        summary:
          "Replaced a company's Excel-based workflows with one integrated system, from stock to cash to customer instalments.",
        points: [
          "Designed the architecture: Laravel backend, Next.js frontend.",
          "An automated finance module covering warehouse stock monitoring, cash transactions and real-time customer instalment tracking.",
          "Automated annual reporting that speeds up business performance evaluation.",
          "The demo is the front end running on made-up sample data (no real company records) and works without the backend.",
        ],
        stack: ["Laravel", "Next.js"],
        demoUrl: "https://simpro-sb-admin-kj9u.vercel.app/signin",
      },
    ],
  },
  {
    company: "PT Aplikasi Uniq Indonesia",
    role: "Backend Developer (Intern)",
    period: "Sep 2024 — Dec 2024",
    cases: [
      {
        title: "FAQ page: content API and chatbot",
        kind: "Backend · Internship",
        summary:
          "Backend for the FAQ page of a content management system, with a chatbot that answers visitors' questions.",
        points: [
          "A RESTful CRUD API for the content management system, built with Node.js and Express.js.",
          "MongoDB data model tuned for more efficient access to FAQ content.",
          "An interactive chatbot on the FAQ page, powered by a Hugging Face model, to answer users faster.",
        ],
        stack: ["Node.js", "Express.js", "MongoDB", "Hugging Face"],
        demoUrl: "https://uniq-faq-dev.web.app/faq",
      },
      {
        title: "Register page",
        kind: "Web · Internship",
        summary:
          "The sign-up page for prospective customers. It looks like one form, but it coordinates four parties (the web app, the API, Firebase and WhatsApp) to prove a visitor owns their phone number before an account exists.",
        points: [
          "Availability first: phone and email are checked against the API before anything is sent, so a visitor learns about a duplicate straight away instead of after the verification step.",
          "Bot protection: a reCAPTCHA token is generated through Firebase and verified by the API before it will send a code.",
          "One-time code over WhatsApp: the API sends it, and the page opens a verification popup that waits for it.",
          "Three different tokens in one flow: the reCAPTCHA token, a custom token returned by the API once the code is valid, and the Firebase token obtained by signing in with that custom token. Each is used for one step only.",
          "The registration is saved only at the end, together with the Firebase token, so a half-finished attempt never leaves an account behind.",
          "Two failure loops that return to the right place: details already taken sends the visitor back to the form, and a wrong code returns to the popup, each with a clear message.",
          "The linked page runs in the company's development environment.",
        ],
        stack: ["Firebase", "reCAPTCHA", "WhatsApp verification", "REST API"],
        demoUrl: "https://ci-uniq-homepage-dev-764190332637.asia-southeast1.run.app/pages/register/user?ref=homepage",
      },
    ],
  },
];

export type SideProject = {
  name: string;
  summary: string;
  stack: string[];
  /** Source repository. */
  href: string;
  /** Hosted demo, when there is one. */
  demoUrl?: string;
};

export const projects: SideProject[] = [
  {
    name: "Solar System Explorer",
    summary:
      "An interactive 3D Solar System you explore by flying your own spaceship. Planets sit at their real positions for today, computed from NASA JPL orbital elements; an autopilot steers around obstacles to any world, which then opens verified fun facts and key stats. Custom velocity-based flight physics, a procedural ship, and a toggle between explorer and true-to-scale distances.",
    stack: ["Next.js", "TypeScript", "Three.js", "React Three Fiber", "Zustand"],
    href: "https://github.com/wynyga/SolarSystem",
    demoUrl: "https://canzyyship.vercel.app/",
  },
  {
    name: "Discord Task Scheduler",
    summary:
      "A full stack app for scheduling messages to a Discord channel through a webhook. Schedules are built from plain choices (raw cron only under Advanced) and run on BullMQ; every attempt is logged with its HTTP code, and failures retry by type: 429 waits for Discord's retry_after, 5xx and timeouts retry, other 4xx stop. Messages are edited as a form or JSON with template variables and a Discord-style preview. Self-hosted on a VPS with Docker Compose and Caddy HTTPS.",
    stack: ["Node.js", "Express", "TypeScript", "BullMQ", "Redis", "PostgreSQL", "React"],
    href: "https://github.com/wynyga/Discord-WebHook",
    demoUrl: "https://discordweebhook.tech",
  },
  {
    name: "ProjectTracker",
    summary:
      "A project-tracking system: an ASP.NET Core API with JWT roles, paging and filters, overdue status derived from end dates, rate limiting and health checks, plus a Next.js dashboard. Covered by 76 tests and checked against a real MySQL container.",
    stack: ["C#", ".NET", "EF Core", "MySQL", "Next.js"],
    href: "https://github.com/wynyga/RESTful-API-NET",
    demoUrl: "https://projecttracker-one-orpin.vercel.app/",
  },
  {
    name: "Go + Redis experiments",
    summary:
      "Small repositories exploring JWT sessions, rate limiting and caching with Redis on top of a Go clean architecture template.",
    stack: ["Go", "Redis", "Rate limiting"],
    href: "https://github.com/wynyga/golang-JWT-Redis",
  },
];

export const skills = [
  { group: "Languages", items: ["Go", "PHP", "TypeScript", "JavaScript", "SQL", "C#"] },
  { group: "Frameworks", items: ["Laravel", "Gin", "React.js", "Next.js", "Node.js", ".NET"] },
  {
    group: "Backend & data",
    items: ["RESTful API", "Microservices", "Clean Architecture", "PostgreSQL", "MySQL", "MongoDB", "Redis", "RabbitMQ"],
  },
  { group: "Tools", items: ["Docker", "Jenkins", "Prometheus", "AWS S3", "Git", "Postman"] },
];

export const education = {
  school: "Universitas Sam Ratulangi Manado",
  degree: "Informatics Engineering",
  period: "2021 — 2025",
  note: "GPA 3.64",
};

export const organization = {
  period: "2022 — 2024",
  role: "Coordinator, Indonesian SAR Robot Contest",
  org: "Robotics Education Student Activity Unit",
  note: "Led the design of an autonomous navigation robot for the Indonesian Robot Contest (KRI).",
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];
