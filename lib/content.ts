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

// Newest first, matching the Experience section. Cases are numbered per company by the page.
export const work: CompanyWork[] = [
  {
    company: "PT Aneka Search Indonesia",
    role: "Full Stack Developer",
    period: "Mar 2026 — Present",
    cases: [
      {
        internal: true,
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
        internal: true,
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
    ],
  },
  {
    company: "PT Bumi Asih",
    role: "Full Stack Developer",
    period: "Jan 2024 — Jan 2026",
    cases: [
      {
        title: "SIMPRO business information system",
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
        title: "Phone-verified registration",
        kind: "Web · Internship",
        summary:
          "A sign-up flow for prospective customers that proves a visitor controls their phone number before an account is created.",
        points: [
          "Checks that the phone number and email are free before anything is sent.",
          "reCAPTCHA through Firebase, then a one-time code delivered by WhatsApp.",
          "After the code is verified, signs in with a Firebase custom token and saves the registration with that token.",
          "Every step has an error path (details already taken, wrong code), so a visitor is never left on a dead end.",
          "The linked page runs in the company's development environment.",
        ],
        stack: ["Firebase", "reCAPTCHA", "WhatsApp verification", "REST API"],
        demoUrl: "https://ci-uniq-homepage-dev-764190332637.asia-southeast1.run.app/pages/register/user?ref=homepage",
      },
    ],
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
  /** Source repository. */
  href: string;
  /** Hosted demo, when there is one. */
  demoUrl?: string;
};

export const projects: SideProject[] = [
  {
    name: "GoBook",
    summary:
      "A library system built as Go microservices behind an API gateway, with a Next.js front end. Borrowing spans services with an atomic copy reservation and compensation when a step fails; the gateway guards internal routes and the web app keeps the JWT in an httpOnly cookie.",
    stack: ["Go", "Microservices", "PostgreSQL", "Docker", "Next.js"],
    href: "https://github.com/wynyga/GoBook",
    demoUrl: "https://go-book-omega.vercel.app/",
  },
  {
    name: "E-commerce API",
    summary:
      "An e-commerce backend split into auth, product and cart services. Each service owns its database migrations and ships in its own container, wired together with Docker Compose.",
    stack: ["Go", "JWT", "Docker", "Microservices"],
    href: "https://github.com/wynyga/E-commerceAPI",
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
