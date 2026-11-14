import type { ReactNode } from "react";
import { CONTACT } from "../data/contact";

const ICONS: Record<string, ReactNode> = {
  email: (
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.6 2 7.4 5.6L19.4 7H4.6ZM4 17h16V9.2l-8 6-8-6V17Z" />
  ),
  github: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.09-.64.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.1v5.9h-4v-5.23c0-1.25-.02-2.85-1.74-2.85-1.74 0-2.01 1.36-2.01 2.76v5.32h-4V9.75Z" />
  ),
  facebook: (
    <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.87.3-1.6 1.6-1.6h1.5V4.3C16.3 4.27 15.4 4.2 14.4 4.2c-2.2 0-3.9 1.35-3.9 3.8v2.5H8v3h2.5V21h3Z" />
  ),
};

export default function Footer() {
  const links = [
    { id: "email", label: "Email", href: `mailto:${CONTACT.email}` },
    { id: "github", label: "GitHub", href: CONTACT.github },
    { id: "linkedin", label: "LinkedIn", href: CONTACT.linkedin },
    { id: "facebook", label: "Facebook", href: CONTACT.facebook },
  ];
  return (
    <footer className="footer">
      <p className="footer-name">
        Built by <b>{CONTACT.name}</b>
      </p>
      <ul className="footer-links">
        {links.map((l) => (
          <li key={l.id}>
            <a
              href={l.href}
              aria-label={l.label}
              title={l.label}
              {...(l.id === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden
              >
                {ICONS[l.id]}
              </svg>
              <span>{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="footer-copy">
        © {new Date().getFullYear()} ICT × SISURU AR · Explore the innovative
        world
      </p>
    </footer>
  );
}
