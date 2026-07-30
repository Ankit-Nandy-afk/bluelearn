import { useEffect, useState } from "react";
import {
  Link,
  createFileRoute,
  notFound,
  useLocation,
} from "@tanstack/react-router";

import type { Walkthrough } from "@bluelearn/schemas";
import { Separator } from "@/components/ui/separator";

import { Route as GuideRoute } from "@/routes/guides/$slug/index";

import { getGuideBySlug } from "@/lib/getData";
import { WalkthroughGraph } from "@/components/graph-view/WalkthroughGraph";
import { getGuideWalkthrough } from "@/lib/api/guides";

import guides from "@/data/guides.json";

export const Route = createFileRoute("/guides/$slug/walkthrough")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();

  const guide = getGuideBySlug(guides, slug);

  // Carried in from the reader so going back restores the trail the user came by.
  const breadcrumbOrigin = useLocation({
    select: (location) => location.state.breadcrumbOrigin,
  });

  const [hoveredGuide, setHoveredGuide] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [walkthroughData, setWalkthroughData] = useState<Walkthrough | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setWalkthroughData(null);
    setError(null);
    getGuideWalkthrough(slug, { signal: controller.signal })
      .then(setWalkthroughData)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      });

    return () => controller.abort();
  }, [slug]);

  // Escape leaves fullscreen, since the toggle button is the only other way out.
  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  if (!guide) {
    throw notFound();
  }

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-[1280px] overflow-y-auto border-x bg-background">
      <section className="flex h-full flex-col px-10 py-4 lg:px-16">
        {/* MAIN */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Walkthrough: {guide.title}
          </h1>
          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={GuideRoute.to}
              params={{ slug: slug }}
              state={{ breadcrumbOrigin }}
              className="btn-outline"
            >
              View Guide
            </Link>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Graph */}
        <div
          className={
            isFullscreen
              ? "fixed inset-0 z-50 bg-background"
              : "min-h-[600px] w-full flex-1 overflow-hidden rounded-xl border border-border bg-muted/10"
          }
        >
          {error ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : walkthroughData ? (
            <WalkthroughGraph
              walkthroughData={walkthroughData}
              targetSlug={slug}
              hoveredGuide={hoveredGuide}
              onHoverGuide={setHoveredGuide}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
              Loading walkthrough...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
