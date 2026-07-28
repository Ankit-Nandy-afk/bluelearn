import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings/policies")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mb-6">
      <div>
        <h1 className="data-label text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          Policies
        </h1>
      </div>

      <Separator className="mb-8 bg-border" />

      <div className="space-y-2">
        <div>
          <a href="#" className="font-mono tracking-[0.08em] uppercase">
            Terms of Service
          </a>
        </div>

        <div>
          <a href="#" className="font-mono tracking-[0.08em] uppercase">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
