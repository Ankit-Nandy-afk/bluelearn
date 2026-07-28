import { Link, createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings/policies")({
  component: RouteComponent,
});

// Link legal pages to marketing site.
const SITE = "https://bluelearn.org";

const LEGAL = [
  { label: "Terms of Service", href: `${SITE}/terms` },
  { label: "Privacy Policy", href: `${SITE}/privacy` },
  { label: "Cookie Policy", href: `${SITE}/cookies` },
];

function RouteComponent() {
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          Policies
        </h1>
      </div>

      <Separator className="mb-8 bg-border" />

      <ul>
        {LEGAL.map((item) => {
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className="data-label flex items-center gap-4 px-2 py-4 underline hover:text-brand-blue"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
