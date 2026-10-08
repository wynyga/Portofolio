import Image from "next/image";
import { nav, profile } from "@/lib/content";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a href="#top" className="brand" aria-label={`${profile.name}, back to top`}>
          <Image src="/logo.png" alt="" width={40} height={40} className="brand-logo" priority />
        </a>
        <nav aria-label="Primary" className="nav">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
