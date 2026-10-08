import Header from "@/components/Header";
import Section from "@/components/Section";
import {
  about,
  education,
  experience,
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

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <p className="mono eyebrow">
              {profile.role} <span aria-hidden="true">/</span> {profile.location}
            </p>
            <h1 className="hero-name">{profile.name}</h1>
            <p className="hero-headline">{profile.headline}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#work">
                See selected work
              </a>
              <a className="btn" href={`mailto:${profile.email}`}>
                Get in touch
              </a>
              {profile.cvUrl && (
                <a className="btn" href={profile.cvUrl} download>
                  Download CV
                </a>
              )}
            </div>
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

        <Section id="work" index="02" label="Selected work">
          <p className="note">
            Built at work, so client and company details are kept out. The focus here is architecture, decisions and
            outcomes.
          </p>
          <ol className="cases">
            {work.map((c) => (
              <li key={c.index} className="case">
                <div className="case-head">
                  <span className="mono case-idx">{c.index}</span>
                  <div>
                    <h3>{c.title}</h3>
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
        </Section>

        <Section id="experience" index="03" label="Experience">
          <ol className="roles">
            {experience.map((r) => (
              <li key={`${r.company}-${r.period}`} className="role">
                <p className="mono period">{r.period}</p>
                <div>
                  <h3>{r.title}</h3>
                  <p className="company">{r.company}</p>
                  <ul className="points">
                    {r.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="projects" index="04" label="Side projects">
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

        <Section id="skills" index="05" label="Skills">
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

        <Section id="background" index="06" label="Background">
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

        <Section id="contact" index="07" label="Contact">
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
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p className="mono">© {new Date().getFullYear()} {profile.name}</p>
          <p className="mono">Built with Next.js · Hosted on Vercel</p>
        </div>
      </footer>
    </>
  );
}
