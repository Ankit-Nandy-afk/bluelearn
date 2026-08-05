import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import { History, House, Users } from "lucide-react";

import type { Action } from "@/components/sidebar/GuideSidebar";
import type { Breadcrumb } from "@/lib/breadcrumbs";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { formatDate, formatDuration } from "@/lib/guideUtils";
import { getObjective } from "@/lib/api/objectives";
import { listGuides } from "@/lib/api/guides";

import ObjectiveFlow from "@/components/objective/ObjectiveFlow";
import { ObjectiveHeader } from "@/components/objective/ObjectiveHeader";

const OBJECTIVE_ACTIONS: Array<Action> = [
  { icon: Users, label: "View Contributors" },
  { icon: History, label: "View Revisions" },
];

export const Route = createFileRoute("/objectives/$slug")({
  loader: async ({ params: { slug }, abortController }) => {
    const [objective, guides] = await Promise.all([
      getObjective(slug, { signal: abortController.signal }),
      listGuides({ signal: abortController.signal }),
    ]);
    return { ...objective, guides };
  },
  pendingComponent: ObjectivePending,
  errorComponent: ObjectiveError,
  component: PathPage,
});

function Shell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
      <section className="border-b px-8 py-8 lg:px-16">
        {header}

        <Separator className="mb-4 bg-border" />

        {children}
      </section>
    </div>
  );
}

function Breadcrumbs({ crumbs }: { crumbs: Array<Breadcrumb> }) {
  return (
    <ul className="mono-micro mb-6 flex min-w-0 flex-nowrap items-center gap-2 text-xs tracking-[0.08em] text-muted-foreground uppercase">
      {crumbs.map((crumb, idx) => (
        <li
          key={`${crumb.label}-${idx}`}
          className="flex min-w-0 items-center gap-2"
        >
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="flex min-w-0 items-center hover:text-foreground"
              aria-label={crumb.label}
            >
              {idx === 0 ? (
                <House className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <span className="max-w-[30ch] truncate">{crumb.label}</span>
              )}
            </Link>
          ) : (
            <span className="max-w-[30ch] truncate">{crumb.label}</span>
          )}
          {idx < crumbs.length - 1 && <span className="shrink-0">/</span>}
        </li>
      ))}
    </ul>
  );
}

function FallbackHeading() {
  return (
    <h1 className="mb-4 font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
      Objective
    </h1>
  );
}

function ObjectivePending() {
  return (
    <Shell header={<FallbackHeading />}>
      <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
    </Shell>
  );
}

function ObjectiveError({ error }: { error: Error }) {
  return (
    <Shell header={<FallbackHeading />}>
      <p className="text-sm text-muted-foreground">
        {error.message || "Objective could not be loaded. Try again shortly."}
      </p>
    </Shell>
  );
}

function PathPage() {
  const { objective, snapshot, guides } = Route.useLoaderData();

  const breadcrumbOrigin = useLocation({
    select: (location) => location.state.breadcrumbOrigin,
  });
  const breadcrumbs = buildBreadcrumbs(
    objective.title ?? "Untitled objective",
    breadcrumbOrigin
  );

  const guideBySlug = new Map(guides.map((g) => [g.slug, g]));
  const nodeById = new Map(snapshot.nodes.map((n) => [n.id, n]));

  const targets = snapshot.nodes
    .filter((n) => n.is_target)
    .sort((a, b) => (a.target_position ?? 0) - (b.target_position ?? 0))
    .map((target) => {
      const sequence = [
        ...snapshot.orders
          .filter((o) => o.target_node_id === target.id)
          .sort((a, b) => a.position - b.position)
          .map((o) => nodeById.get(o.node_id))
          .filter((node) => node !== undefined),
        target,
      ];

      return {
        slug: target.slug ?? target.id,
        title: target.title ?? "Untitled guide",
        summary: null,
        guides: sequence.map((node) => {
          const guide = node.slug ? guideBySlug.get(node.slug) : undefined;
          return {
            guide: {
              slug: node.slug ?? "",
              title: node.title ?? "Untitled guide",
              author: guide?.author,
              summary: guide?.summary,
              created_at: guide
                ? formatDate(new Date(guide.created_at))
                : undefined,
              tags: guide?.tags,
              duration: formatDuration(guide?.duration_minutes ?? 0),
            },
          };
        }),
      };
    });

  const totalGuides = targets.reduce((acc, t) => acc + t.guides.length, 0);
  const totalDuration = snapshot.nodes
    .filter((n) => n.is_included)
    .reduce(
      (acc, n) =>
        acc + (n.slug ? (guideBySlug.get(n.slug)?.duration_minutes ?? 0) : 0),
      0
    );

  return (
    <Shell
      header={
        <>
          <Breadcrumbs crumbs={breadcrumbs} />

          <ObjectiveHeader
            objective={objective}
            stats={{
              guides: totalGuides,
              durationMinutes: totalDuration,
            }}
            actions={
              <div className="flex shrink-0 items-center gap-2">
                {OBJECTIVE_ACTIONS.map((action: Action) => (
                  <Tooltip key={action.label}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="lg">
                        <action.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            }
          />
        </>
      }
    >
      {targets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This objective has no sub-objectives yet.
        </p>
      ) : (
        <ObjectiveFlow objective={objective} targets={targets} />
      )}
    </Shell>
  );
}
