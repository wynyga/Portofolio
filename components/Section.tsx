import Reveal from "./Reveal";

export default function Section({
  id,
  index,
  label,
  children,
}: {
  id: string;
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-label`}>
      <div className="wrap section-grid">
        <div className="section-label">
          <h2 id={`${id}-label`} className="mono">
            <span className="idx">{index}</span> {label}
          </h2>
        </div>
        <Reveal className="section-body">{children}</Reveal>
      </div>
    </section>
  );
}
