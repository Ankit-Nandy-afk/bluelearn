import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Separator } from "@/components/ui/separator";
import { ObjectiveCard } from "@/components/cards/ObjectiveCard";

import { listObjectives } from "@/lib/api/objectives";

import { Route as ObjectiveRoute } from "@/routes/objectives.$slug";

const PAGE_SIZE = 20;

const objectivesSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const Route = createFileRoute("/objectives/")({
  validateSearch: objectivesSearchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ deps: { page } }) => {
    const result = await listObjectives({ page, limit: PAGE_SIZE });
    const objectives = result.objectives
      .filter((o): o is typeof o & { slug: string } => o.slug !== null)
      .map((o) => ({
        slug: o.slug,
        title: o.title,
        summary: o.summary,
        curator: o.curator,
        created_at: o.created_at,
        featuredSubObjective: o.featured_sub_objective,
        stats: [
          { label: "Duration", data: `${o.duration_minutes} min` },
          { label: "Guides", data: o.guides_total },
        ] as Array<{ label: string; data: string | number }>,
      }));
    return { objectives, total: result.total, page };
  },
  pendingComponent: ObjectivesPending,
  errorComponent: ObjectivesError,
  component: ObjectivesIndex,
});

function ObjectivesIndex() {
  const { objectives, total, page } = Route.useLoaderData();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Objectives
          </h1>
        </div>

        <Separator className="mb-4 bg-border" />

        {objectives.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No objectives found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {objectives.map((objective) => (
              <ObjectiveCard
                key={objective.slug}
                objective={objective}
                to={ObjectiveRoute.to}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </section>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const baseClass =
    "px-3 py-1.5 rounded-md text-sm font-medium border border-border";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 pt-6"
    >
      <Link
        to="/objectives"
        search={{ page: currentPage - 1 }}
        disabled={currentPage <= 1}
        className={`${baseClass} ${
          currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
        }`}
      >
        Previous
      </Link>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <Link
            key={p}
            to="/objectives"
            search={{ page: p }}
            className={`${baseClass} ${
              p === currentPage
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      <Link
        to="/objectives"
        search={{ page: currentPage + 1 }}
        disabled={currentPage >= totalPages}
        className={`${baseClass} ${
          currentPage >= totalPages
            ? "pointer-events-none opacity-50"
            : "hover:bg-muted"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

function ObjectivesPending() {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background px-8 py-8">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />
      <Separator className="mb-4 bg-border" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

function ObjectivesError({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background px-8 py-16 text-center">
      <h2 className="text-2xl font-bold text-destructive">
        Error loading objectives
      </h2>
      <p className="mt-2 text-muted-foreground">
        {error.message || "An error occurred while loading objectives."}
      </p>
    </div>
  );
}
