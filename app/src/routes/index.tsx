import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";

import { Route as SubjectRoute } from "@/routes/subjects.$slug";
import { listSubjects } from "@/lib/api/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Links into the seeded "About Bluelearn" guides that explain the platform.
const CONCEPTS = [
  {
    slug: "what-is-bluelearn",
    label: "What is Bluelearn?",
    blurb: "A free, community-built knowledge base.",
  },
  {
    slug: "what-is-a-guide",
    label: "What is a Guide?",
    blurb: "The basic unit: one article per topic.",
  },
  {
    slug: "what-is-a-knowledge-graph",
    label: "What is a Knowledge Graph?",
    blurb: "Guides linked by prerequisite edges.",
  },
  {
    slug: "what-is-an-objective",
    label: "What is an Objective?",
    blurb: "A curated path toward a goal.",
  },
];

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
  const { subjects, subjectsFailed } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
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
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
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
        <div className="flex gap-3">
          <div className="relative flex-1 rounded-md">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search guides, concepts, topics..."
              className="h-14 pr-12 pl-11 text-base"
            />

            <button className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-md border"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button className="btn-pri h-14 px-8">Search</Button>
        </div>
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

      {/* Learn about Bluelearn */}
      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-6">
          <p className="data-label text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            Learn About Bluelearn
          </p>
        </div>

        <Separator className="mb-4 bg-border" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONCEPTS.map((concept) => (
            <Link
              to="/guides/$slug"
              params={{ slug: concept.slug }}
              key={concept.slug}
              className="group flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-badge"
            >
              <p className="mono-micro tracking-[0.08em] uppercase">
                {concept.label}
              </p>
              <p className="text-sm text-muted-foreground">{concept.blurb}</p>
              <span className="mono-micro mt-2 inline-flex items-center tracking-[0.08em] text-muted-foreground uppercase group-hover:text-foreground">
                Read
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
