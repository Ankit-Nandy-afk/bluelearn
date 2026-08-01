import { Link, createFileRoute } from "@tanstack/react-router";
import { Ellipsis, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { formatDate, formatDuration } from "@/lib/guideUtils";
import { getObjective } from "@/lib/api/objectives";
import { getMyIdentity } from "@/lib/api/identity";
import { listGuides } from "@/lib/api/guides";

import ObjectiveFlow from "@/components/objective/ObjectiveFlow";

export const Route = createFileRoute("/objectives/$slug")({
  loader: async ({ params: { slug }, abortController }) => {
    const [objective, guides, identity] = await Promise.all([
      getObjective(slug, { signal: abortController.signal }),
      listGuides({ signal: abortController.signal }),
      getMyIdentity({ signal: abortController.signal }).catch(() => null),
    ]);
    return { ...objective, guides, identity };
  },
  pendingComponent: ObjectivePending,
  errorComponent: ObjectiveError,
  component: PathPage,
});

function Shell({
  heading,
  actions,
  children,
}: {
  heading: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            {heading}
          </h1>

          {actions}
        </div>

        <Separator className="mb-4 bg-border" />

        {children}
      </section>
    </div>
  );
}

function ObjectivePending() {
  return (
    <Shell heading="Objective">
      <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
    </Shell>
  );
}

function ObjectiveError({ error }: { error: Error }) {
  return (
    <Shell heading="Objective">
      <p className="text-sm text-muted-foreground">
        {error.message || "Objective could not be loaded. Try again shortly."}
      </p>
    </Shell>
  );
}

function ObjectiveMenu({
  slug,
  sourceRevisionId,
}: {
  slug: string;
  sourceRevisionId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 font-mono">
        <DropdownMenuItem asChild>
          <Link
            to="/contribute"
            search={{ source: sourceRevisionId, edit: slug }}
            className="text-xs"
          >
            <Pencil className="h-4 w-4" />
            Edit Objective
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PathPage() {
  const { slug } = Route.useParams();
  const { objective, snapshot, guides, identity } = Route.useLoaderData();
  const isCurator = identity?.roles.includes("curator") ?? false;

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
      heading={`Objective: ${objective.title ?? "Untitled"} (${targets.length} sub-objectives | ${totalGuides} guides | ${formatDuration(totalDuration)} total)`}
      actions={
        isCurator && objective.current_revision_id ? (
          <ObjectiveMenu
            slug={slug}
            sourceRevisionId={objective.current_revision_id}
          />
        ) : null
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
