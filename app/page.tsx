import Link from "next/link";
import BackToTop from "@/components/BackToTop";
import CrewSection from "@/components/CrewSection";
import DescentRail from "@/components/DescentRail";
import Header from "@/components/Header";
import HeroScene from "@/components/HeroScene";
import MoonSurface from "@/components/MoonSurface";
import Section from "@/components/Section";
import {
  about,
  education,
  facts,
  organization,
  profile,
  projects,
  skills,
  work,
} from "@/lib/content";

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags" aria-label="Technologies">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <a href="#about" className="skip-link">
        Skip to content
      </a>
      <Header />
      <DescentRail />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="mono eyebrow">
                <span className="status-dot" aria-hidden="true" />
                {profile.role} <span aria-hidden="true">/</span> {profile.location}
              </p>
              <h1 className="hero-name">{profile.name}</h1>
              <p className="hero-headline">{profile.headline}</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#work">
                  See work experience
                </a>
                {profile.cv.length > 0 && (
                  <span className="btn cv-pick" role="group" aria-label="Download CV">
                    <span className="cv-pick-label">Download CV</span>
                    {profile.cv.map((c) => (
                      <a key={c.lang} href={c.href} download title={`CV in ${c.label} (PDF)`} aria-label={`Download CV in ${c.label}`}>
                        {c.lang}
                      </a>
                    ))}
                  </span>
                )}
                <Link className="btn" href="/moon">
                  Walk on the moon
                </Link>
              </div>
            </div>
            <HeroScene />
          </div>
        </section>

        <Section id="about" index="01" label="About">
          <div className="prose">
            <p className="lede">{profile.intro}</p>
            {about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="work" index="02" label="Work experience">
          {work.map((company) => (
            <div key={company.company} className="company">
              <h3 className="mono company-head">
                <span className="company-name">{company.company}</span>
                <span>
                  {company.role} · {company.period}
                </span>
              </h3>
              <ol className="cases">
                {company.cases.map((c, i) => (
                  <li key={c.title} className="case">
                    <div className="case-head">
                      <span className="mono case-idx">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h4>{c.title}</h4>
                        <p className="mono kind">{c.kind}</p>
                      </div>
                    </div>
                    <p className="case-summary">{c.summary}</p>
                    <ul className="points">
                      {c.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <Tags items={c.stack} />
                    {c.internal && (
                      <div className="project-links">
                        <button type="button" className="btn btn-sm" disabled aria-label={`${c.title}: internal tool, not publicly available`}>
                          Internal Tools
                        </button>
                      </div>
                    )}
                    {c.demoUrl && (
                      <div className="project-links">
                        <a className="btn btn-sm btn-primary" href={c.demoUrl} target="_blank" rel="noopener noreferrer">
                          Live demo <span aria-hidden="true">↗</span>
                          <span className="sr-only"> of {c.title} (opens in a new tab)</span>
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Section>

        <Section id="projects" index="03" label="Side projects">
          <p className="note">Open-source practice projects on GitHub, mostly in Go.</p>
          <ul className="projects">
            {projects.map((p) => (
              <li key={p.name}>
                <article className="project">
                  <h3>{p.name}</h3>
                  <p className="project-summary">{p.summary}</p>
                  <Tags items={p.stack} />
                  <div className="project-links">
                    {p.demoUrl && (
                      <a className="btn btn-sm btn-primary" href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                        Live demo <span aria-hidden="true">↗</span>
                        <span className="sr-only"> of {p.name} (opens in a new tab)</span>
                      </a>
                    )}
                    <a className="btn btn-sm" href={p.href} target="_blank" rel="noopener noreferrer">
                      GitHub <span aria-hidden="true">↗</span>
                      <span className="sr-only"> repository for {p.name} (opens in a new tab)</span>
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="skills" index="04" label="Skills">
          <dl className="skills">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="mono">{s.group}</dt>
                <dd>
                  <Tags items={s.items} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="background" index="05" label="Background">
          <div className="bg-list">
            <div className="role">
              <p className="mono period">{education.period}</p>
              <div>
                <h3>{education.school}</h3>
                <p className="company">
                  {education.degree} · {education.note}
                </p>
              </div>
            </div>
            <div className="role">
              <p className="mono period">{organization.period}</p>
              <div>
                <h3>{organization.role}</h3>
                <p className="company">{organization.org}</p>
                <p className="muted">{organization.note}</p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="contact" index="06" label="Contact">
          <p className="contact-lede">Have a project, a role or a question about something I've built? Say hello.</p>
          <a className="contact-mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <ul className="contact-links">
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            </li>
          </ul>
        </Section>

        <Section id="crew" index="07" label="Crew">
          <CrewSection />
        </Section>
      </main>

      <footer className="site-footer">
        <MoonSurface />
        <div className="wrap footer-inner">
          <p className="mono">
            <Link href="/moon">Explore this moon in 3D →</Link>
          </p>
          <p className="mono">© {new Date().getFullYear()} {profile.name}</p>
          <p className="mono">Built with Next.js · Hosted on Vercel</p>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}
