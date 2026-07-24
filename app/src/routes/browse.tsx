import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type {
  Collection,
  KnowledgeType,
  SearchFilters,
} from "@/lib/api/search";
import { Separator } from "@/components/ui/separator";
import { ObjectiveCard } from "@/components/cards/ObjectiveCard";

import { Route as ObjectiveRoute } from "@/routes/objectives.$slug";
import { Route as GuideRoute } from "@/routes/guides/$slug/index";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import { GuideCard } from "@/components/cards/GuideCard";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilterMenu } from "@/components/SearchFilterMenu";
import { filtersToParams, search } from "@/lib/api/search";

// The filter selection lives in the URL: `type` = scope, `kind` = knowledge
// type. Both are optional so a first visit to /browse has a clean URL.
type BrowseSearch = { q?: string; type?: Collection; kind?: KnowledgeType };

export const Route = createFileRoute("/browse")({
  validateSearch: (search): BrowseSearch => {
    const q = typeof search.q === "string" ? search.q.trim() : "";
    const type =
      search.type === "guides" || search.type === "objectives"
        ? search.type
        : undefined;
    const kind =
      search.kind === "theoretical" || search.kind === "practical"
        ? search.kind
        : undefined;
    return {
      ...(q ? { q } : {}),
      ...(type ? { type } : {}),
      ...(type === "guides" && kind ? { kind } : {}),
    };
  },
  loaderDeps: ({ search: { q, type, kind } }) => ({ q, type, kind }),
  // A failed search returns as data (not a thrown error) so the search bar
  // stays mounted and the user can retry or adjust the query.
  loader: async ({ deps: { q, type, kind }, abortController }) => {
    if (!q) return { results: null, error: null };
    try {
      const results = await search(
        { q, ...filtersToParams({ scope: type, knowledgeType: kind }) },
        { signal: abortController.signal }
      );
      return { results, error: null };
    } catch (e) {
      return {
        results: null,
        error: e instanceof Error ? e.message : "Search failed",
      };
    }
  },
  component: RouteComponent,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl border-x bg-background">{children}</div>
  );
}

function RouteComponent() {
  const { q, type, kind } = Route.useSearch();
  const { results, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  // Local field state, kept in sync with the URL so back/forward updates it.
  const [query, setQuery] = useState(q ?? "");
  useEffect(() => setQuery(q ?? ""), [q]);

  const sectionHeadingCommonClassNames =
    "font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground ml-1";

  // Merge into existing params so q and the filters don't clobber each other.
  // validateSearch drops empty values, keeping the URL clean.
  const submit = (next: string) =>
    navigate({ search: (prev) => ({ ...prev, q: next.trim() }) });
  const setFilters = (f: SearchFilters) =>
    navigate({
      search: (prev) => ({ ...prev, type: f.scope, kind: f.knowledgeType }),
    });

  const showGuides = type !== "objectives";
  const showObjectives = type !== "guides";

  return (
    <Shell>
      <section className="border-b px-8 py-10 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Browse
          </h1>
        </div>

        <Separator className="mb-8 bg-border" />

        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => submit(query)}
          onClear={() => {
            setQuery("");
            submit("");
          }}
          filter={
            <SearchFilterMenu
              value={{ scope: type, knowledgeType: kind }}
              onChange={setFilters}
            />
          }
        />
      </section>

      {error && (
        <p className="px-8 py-10 text-sm text-destructive lg:px-16">
          Search is unavailable right now. Try again shortly.
        </p>
      )}

      {results && (
        <section className="px-8 py-10 lg:px-16">
          {/* Objectives */}
          {showObjectives && (
            <CollapsibleSection
              title={
                <h2 className={sectionHeadingCommonClassNames}>
                  Learning Objectives ({results.objectives.found})
                </h2>
              }
              defaultOpen={true}
            >
              <Separator className="mb-8 h-[0.5px]! bg-border" />
              {results.objectives.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No objectives found.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {results.objectives.items.map((o) => (
                    <ObjectiveCard
                      key={o.id}
                      objective={{
                        slug: o.slug ?? "",
                        title: o.title,
                        summary: o.summary,
                        curator: o.curator,
                        created_at: o.created_at,
                        featuredSubObjective: o.featured_sub_objective,
                      }}
                      to={ObjectiveRoute.to}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Guides */}
          {showGuides && (
            <CollapsibleSection
              title={
                <h2 className={sectionHeadingCommonClassNames}>
                  Guides ({results.guides.found})
                </h2>
              }
              defaultOpen={true}
            >
              <Separator className="mb-8 bg-border" />
              {results.guides.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No guides found.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {results.guides.items.map((g) => (
                    <GuideCard
                      key={g.id}
                      guide={{
                        slug: g.slug ?? "",
                        title: g.title ?? "",
                        author: g.author,
                        summary: g.summary,
                        created_at: g.created_at,
                        status: g.status,
                        tags: g.tags,
                      }}
                      to={GuideRoute.to}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )}
        </section>
      )}
    </Shell>
  );
}
