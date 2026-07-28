import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

const NAV_ITEMS = [
  { label: "Account", to: "/settings/account" as const },
  { label: "Policies", to: "/settings/policies" as const },
  { label: "Appearance", to: "/settings/appearance" as const },
];

function RouteComponent() {
  return (
    <div className="mx-auto max-w-[1280px] bg-background">
      <div className="flex min-h-[calc(100svh_-_64px)]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 shrink-0 space-y-3 border-r border-border p-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block h-auto w-full rounded-md p-4 font-mono tracking-[0.08em] uppercase hover:bg-muted"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 px-8 py-8 lg:px-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

    </div>
  );
}
