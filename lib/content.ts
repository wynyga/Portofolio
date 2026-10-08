// All site copy lives here. Edit this file; the components only render it.

export const profile = {
  name: "Wayan Candra Yoga Kamandanu",
  shortName: "Wayan Candra Yoga",
  role: "Full Stack Developer",
  location: "Manado, North Sulawesi, Indonesia",
  headline: "I build the backend systems and internal tools that teams rely on every day.",
  intro:
    "Informatics Engineering graduate working across Laravel, Next.js and Go. I design microservices, tune them for latency, and ship internal applications that business teams use directly.",
  email: "wayancandrayoga@gmail.com",
  github: "https://github.com/wynyga",
  linkedin: "https://www.linkedin.com/in/wayan-kamandanu-8a925621b/",
  // Set to a path under /public (e.g. "/Wayan_Candra_Yoga_Kamandanu_CV.pdf") to show a CV button.
  // Left empty on purpose: the PDF contains a phone number.
  cvUrl: "",
};

export const about = [
  "I'm a full stack developer based in Manado. I studied Informatics Engineering at Universitas Sam Ratulangi and graduated with a GPA of 3.64.",
  "Most of my work sits on the backend: distributed Laravel services behind a Go gateway, event-driven processing with RabbitMQ, and Redis caching to keep response times down. I also build the interfaces on top, in Next.js and React, because the best internal tools come from owning the whole path from database to screen.",
  "At university I coordinated the SAR robot team in our robotics unit, designing an autonomous navigation robot for the Indonesian Robot Contest. Today I use personal projects to practise Go, clean architecture and containerised deployments.",
];

export const facts = [
  { label: "Currently", value: "Full Stack Developer, PT Aneka Search Indonesia" },
  { label: "Focus", value: "Distributed backends, internal tools, performance" },
  { label: "Core stack", value: "Go · Laravel · Next.js · PostgreSQL · Redis" },
];

export type CaseStudy = {
  index: string;
  title: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
};

// Company and client names are intentionally left out of these case studies.
export const work: CaseStudy[] = [
  {
    index: "01",
    title: "Distributed assessment platform",
    kind: "Backend · Architecture",
    summary:
      "The core services behind an online assessment and recruitment product, split into independently deployable microservices.",
    points: [
      "Laravel microservices for candidate, content, tenant, interview and organisation domains.",
      "A Go API gateway that routes and manages requests across services.",
      "Asynchronous event processing over RabbitMQ so slow work never blocks a request.",
      "Redis as a caching layer to cut response latency on hot reads.",
      "Everything containerised with Docker so development and production behave the same.",
    ],
    stack: ["Laravel", "Go", "RabbitMQ", "Redis", "Docker"],
  },
  {
    index: "02",
    title: "Assessment support tools",
    kind: "Full stack · Internal product",
    summary:
      "An internal application the assessment team uses to generate and manage question banks, without engineering in the loop.",
    points: [
      "Question bank generation and management, built with Next.js on a Laravel API.",
      "An AI interview generation feature, built into the same workflow.",
      "A centralised audit log that records every data change made through the admin-role tools, so changes are traceable.",
    ],
    stack: ["Next.js", "Laravel", "PostgreSQL", "TypeScript"],
  },
  {
    index: "03",
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
    index: "04",
    title: "Talent analytics dashboard",
    kind: "Frontend · Data",
    summary:
      "An interactive analytics dashboard for exploring a talent dataset, rebuilt from a static mockup into a working React app.",
    points: [
      "React front end with Recharts visualisations and TanStack Query for data access.",
      "Queries run against an in-browser SQLite database (sql.js), so filtering stays instant with no server round-trip.",
      "Covered by unit tests (Vitest) and end-to-end tests (Playwright).",
    ],
    stack: ["React", "TypeScript", "Recharts", "SQLite (sql.js)", "Playwright"],
  },
  {
    index: "05",
    title: "SIMPRO business information system",
    kind: "Full stack · Digitisation",
    summary:
      "Replaced a company's Excel-based workflows with one integrated system, from stock to cash to customer instalments.",
    points: [
      "Designed the architecture: Laravel backend, Next.js frontend.",
      "An automated finance module covering warehouse stock monitoring, cash transactions and real-time customer instalment tracking.",
      "Automated annual reporting that speeds up business performance evaluation.",
    ],
    stack: ["Laravel", "Next.js"],
  },
];

export type Role = {
  period: string;
  title: string;
  company: string;
  points: string[];
};

export const experience: Role[] = [
  {
    period: "Mar 2026 — Present",
    title: "Full Stack Developer",
    company: "PT Aneka Search Indonesia",
    points: [
      "Develop Laravel microservices in a distributed architecture covering the Candidate, Content, Tenant, Interview and Organization core services.",
      "Use Go as an API gateway to route and manage requests across microservices.",
      "Implement asynchronous event processing with RabbitMQ as the message broker.",
      "Optimise service performance with Redis caching to reduce response latency.",
      "Deploy all services in Docker so development and production stay consistent.",
      "Built the assessment support tools, including AI interview generation and an audit log for admin data changes.",
      "Built an internal dashboard that monitors participant spikes on the online test platform, with Prometheus alerting and real-time checks.",
    ],
  },
  {
    period: "Jan 2024 — Jan 2026",
    title: "Full Stack Developer",
    company: "PT Bumi Asih",
    points: [
      "Designed SIMPRO to move business processes from Excel into an integrated system.",
      "Built the architecture with Laravel on the backend and Next.js on the frontend.",
      "Developed an automated finance module: warehouse stock monitoring, cash transactions and real-time customer instalment tracking.",
      "Implemented automated annual reporting to speed up performance evaluation.",
    ],
  },
  {
    period: "Sep 2024 — Dec 2024",
    title: "Backend Developer (Intern)",
    company: "PT Aplikasi Uniq Indonesia",
    points: [
      "Built a RESTful CRUD API for a content management system with Node.js.",
      "Optimised the data model in MongoDB for more efficient access.",
      "Integrated an interactive chatbot on the FAQ page using a Hugging Face model, improving response time for users.",
    ],
  },
];

export type SideProject = {
  name: string;
  summary: string;
  stack: string[];
  href: string;
};

export const projects: SideProject[] = [
  {
    name: "E-commerce API",
    summary:
      "An e-commerce backend split into auth, product and cart services. Each service owns its database migrations and ships in its own container, wired together with Docker Compose.",
    stack: ["Go", "JWT", "Docker", "Microservices"],
    href: "https://github.com/wynyga/E-commerceAPI",
  },
  {
    name: "Gotoko",
    summary:
      "A bookstore management REST API in Go with authentication, books, stock and customers, organised into domain, repository, service and API layers.",
    stack: ["Go", "REST", "Clean architecture", "SQL migrations"],
    href: "https://github.com/wynyga/Gotoko",
  },
  {
    name: "RESTful API .NET",
    summary:
      "A layered ASP.NET REST API with role-aware users, authentication, a projects module, a dashboard summary endpoint and EF Core migrations.",
    stack: ["C#", ".NET", "Entity Framework", "REST"],
    href: "https://github.com/wynyga/RESTful-API-NET",
  },
  {
    name: "Auth JWT service",
    summary:
      "A focused Go service for sign-up and login with JWT, middleware-based route protection and database migrations.",
    stack: ["Go", "JWT", "Migrations"],
    href: "https://github.com/wynyga/authJWT-service",
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
  { group: "Languages", items: ["Go", "PHP", "TypeScript", "JavaScript", "C++", "Python", "C#"] },
  { group: "Frameworks", items: ["Laravel", "React.js", "Next.js", "Node.js", ".NET"] },
  {
    group: "Backend & data",
    items: ["RESTful API", "MVC", "Clean Architecture", "MySQL", "PostgreSQL", "MongoDB"],
  },
  { group: "Tools", items: ["Docker", "Git", "Postman", "Jenkins"] },
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
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];
