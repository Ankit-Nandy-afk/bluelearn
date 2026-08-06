import { useEffect, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import type { QueueCase } from "@/lib/api/reviews";
import { NotFound } from "@/components/NotFound";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRequireRole } from "@/lib/authContext";

import { Route as ReviewCaseIdRoute } from "@/routes/review.$caseId";
import { getReviewQueue } from "@/lib/api/reviews";

export const Route = createFileRoute("/review/")({
  loader: async ({ abortController }) => {
    try {
      return await getReviewQueue({ signal: abortController.signal });
    } catch (err) {
      if (abortController.signal.aborted) throw err;
      return [];
    }
  },
  component: RouteComponent,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl border-x bg-background">
      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-6">
          <h1 className="data-label text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Review Queue
          </h1>
        </div>

        <Separator className="mb-4 bg-border" />

        {children}
      </section>
    </div>
  );
}

function RouteComponent() {
  const cases = Route.useLoaderData();
  const access = useRequireRole("verifier");

  if (access === "pending") return null;
  if (access === "not-found") return <NotFound />;

  if (cases.length === 0) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">No review cases yet.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <CaseGrid cases={cases} />
    </Shell>
  );
}

interface CaseTimerProps {
  assignedAt: string;
  expiresAt?: string;
  decision?: QueueCase["decision"];
}

function formatDuration(
  totalSec: number,
  suffix: "remaining" | "elapsed"
): string {
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days >= 1) {
    return `${days}d ${hours}h ${mins}m ${suffix}`;
  }
  if (hours >= 1) {
    return `${hours}h ${mins}m ${secs.toString().padStart(2, "0")}s ${suffix}`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s ${suffix}`;
}

function CaseTimer({ assignedAt, expiresAt, decision }: CaseTimerProps) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (decision) return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      if (expiresAt && new Date(expiresAt).getTime() - currentNow <= 0) {
        router.invalidate();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [decision, expiresAt, router]);

  if (decision) return null;

  if (expiresAt) {
    const diffMs = new Date(expiresAt).getTime() - now;

    if (diffMs <= 0) {
      return (
        <span className="font-mono text-xs text-destructive">Expired</span>
      );
    }

    const remainingSec = Math.floor(diffMs / 1000);

    return (
      <span className="font-mono text-xs text-muted-foreground">
        {formatDuration(remainingSec, "remaining")}
      </span>
    );
  }

  // Fallback: Time elapsed since assignment
  const elapsedSec = Math.max(
    0,
    Math.floor((now - new Date(assignedAt).getTime()) / 1000)
  );

  return (
    <span className="font-mono text-xs text-muted-foreground">
      {formatDuration(elapsedSec, "elapsed")}
    </span>
  );
}

// Not voted yet = still needs the reviewer's attention. Once voted, echo the
// standing vote and flag that it can still be changed until the panel closes.
function reviewerStatus(decision: QueueCase["decision"]) {
  return decision ? `${decision} • editable` : "needs review";
}

function CaseGrid({ cases }: { cases: Array<QueueCase> }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {cases.map((c) => (
        <Link
          key={c.id}
          to={ReviewCaseIdRoute.to}
          params={{ caseId: c.id }}
          className="block"
        >
          <div className="rounded-md border bg-background p-4 shadow-none transition-colors hover:bg-muted">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {c.case_type === "guide_edit"
                  ? "Guide Revision"
                  : "Guide Creation"}
              </p>
              <Badge
                variant="outline"
                className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
              >
                {reviewerStatus(c.decision)}
              </Badge>
            </div>

            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              {c.title ?? "Untitled Guide"}
            </h3>

            <div className="">
              <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                {new Date(c.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <CaseTimer
                assignedAt={c.assigned_at}
                expiresAt={c.expires_at}
                decision={c.decision}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
