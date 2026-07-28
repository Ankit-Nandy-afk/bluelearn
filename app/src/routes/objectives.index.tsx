import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { paginationSchema } from "@bluelearn/schemas";

import { Separator } from "@/components/ui/separator";
import { ObjectiveCard } from "@/components/cards/ObjectiveCard";

import { listObjectives } from "@/lib/api/objectives";
import { formatDate, formatDuration } from "@/lib/guideUtils";
import { Pagination } from "@/components/Pagination";

import { Route as ObjectiveRoute } from "@/routes/objectives.$slug";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/objectives/")({
  validateSearch: paginationSchema.pick({ page: true }),
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
        created_at: formatDate(new Date(o.created_at)),
        featuredSubObjective: o.featured_sub_objective,
        stats: [
          { label: "Duration", data: formatDuration(o.duration_minutes) },
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
  const navigate = useNavigate();

  const goToPage = (p: number) =>
    navigate({ to: "/objectives", search: { page: p } });

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
          <div className="mt-8 mb-4">
            <Pagination
              activePageNo={page}
              onPageSelect={goToPage}
              toFirst={() => goToPage(1)}
              onPrevious={() => goToPage(Math.max(1, page - 1))}
              onNext={() => goToPage(Math.min(totalPages, page + 1))}
              toLast={() => goToPage(totalPages)}
              totalPages={totalPages}
            />
          </div>
        )}
      </section>
    </div>
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
