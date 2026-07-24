import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { HydratedObjective } from "@/types/objectives";
import type { SearchFilters } from "@/lib/api/search";
import { FeaturedRow } from "@/components/FeaturedRow";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilterMenu } from "@/components/SearchFilterMenu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { listSubjects } from "@/lib/api/subjects";
import { Route as SubjectRoute } from "@/routes/subjects.$slug";

import guides from "@/data/guides.json";
import objectives from "@/data/objectives.json";

import { hydrateObjectives } from "@/lib/getData";

// subjects failing shouldn't take down the rest of the homepage, so the
// failure is data instead of an errorComponent
export const Route = createFileRoute("/")({
  loader: async ({ abortController }) => {
    try {
      return {
        subjects: await listSubjects({ signal: abortController.signal }),
        subjectsFailed: false,
      };
    } catch {
      return { subjects: [], subjectsFailed: true };
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const hydratedObjectives: Array<HydratedObjective> = hydrateObjectives(
    guides,
    objectives
  );
  const { subjects, subjectsFailed } = Route.useLoaderData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});

  return (
    <div className="mx-auto max-w-7xl border-x bg-background">
      {/* Hero */}
      <section className="border-b">
        <div className="grid items-center gap-12 px-8 py-16 lg:grid-cols-[1fr_320px] lg:px-16">
          {/* Left */}
          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              Browse Knowledge
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] lg:text-6xl">
              Welcome to{" "}
              <span className="text-brand-blue italic">Bluelearn</span>,
              <br />
              have a look around...
            </h1>
            <p className="mt-6 max-w-xl font-mono text-sm text-muted-foreground">
              anything and everything you think of can be found
              <span className="font font-bold text-brand-blue">*</span>
            </p>
          </div>
          {/* Right */}
          <div className="flex flex-col items-end">
            <div className="aspect-4/3 w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src="/assets/hero.png"
                alt="Bluelearn"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mt-3 text-right font-mono text-xs tracking-[0.08em] text-muted-foreground">
              <span className="font-bold text-brand-blue">*</span>can't find
              your subject area,
              <br />
              contribute a guide
            </p>
          </div>
        </div>
      </section>
      <section className="border-b px-8 py-10 lg:px-16">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => {
            const q = query.trim();
            if (q)
              navigate({
                to: "/browse",
                search: {
                  q,
                  type: filters.scope,
                  kind: filters.knowledgeType,
                },
              });
          }}
          filter={<SearchFilterMenu value={filters} onChange={setFilters} />}
        />
      </section>

      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-6">
          <p className="data-label text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            Browse Subjects
          </p>
        </div>

        <Separator className="mb-4 bg-border" />

        {subjectsFailed && (
          <p className="text-sm text-muted-foreground">
            Subjects could not be loaded. Try again shortly.
          </p>
        )}

        {!subjectsFailed && subjects.length === 0 && (
          <p className="text-sm text-muted-foreground">No subjects yet.</p>
        )}

        <div className="flex flex-wrap gap-3">
          {[...subjects]
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 24)
            .map((subject) => (
              <Link
                to={SubjectRoute.to}
                params={{ slug: subject.slug }}
                key={subject.slug}
              >
                <Badge
                  variant="outline"
                  className="mono-micro rounded-full border p-4 tracking-[0.08em] transition-colors hover:bg-badge"
                >
                  {subject.name}
                </Badge>
              </Link>
            ))}
        </div>

        {subjects.length > 24 && (
          <div className="flex justify-center">
            <Link
              to="/subjects"
              className="mono-micro inline-flex items-center justify-center p-4 tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Show More Subjects
              <ChevronRight />
            </Link>
          </div>
        )}
      </section>

      {/* Featured Section */}
      <FeaturedRow objectives={hydratedObjectives} type={"Recently Added"} />
      <FeaturedRow objectives={hydratedObjectives} type={"Popular This Week"} />
    </div>
  );
}
