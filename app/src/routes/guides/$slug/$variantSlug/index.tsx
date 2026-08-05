import { useState } from "react";
import {
  Link,
  createFileRoute,
  notFound,
  useLocation,
} from "@tanstack/react-router";
import {
  ArrowBigDown,
  ArrowBigUp,
  Ellipsis,
  History,
  House,
  Pencil,
  Plus,
  Replace,
  Target,
  Users,
} from "lucide-react";

import type { Action } from "@/components/sidebar/GuideSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { getVariantBySlug } from "@/lib/api/variants";

import "katex/dist/katex.min.css";
import { GuideSidebar } from "@/components/sidebar/GuideSidebar";
import { GuideReader } from "@/components/GuideReader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_ACTIONS: Array<Action> = [
  { icon: Replace, label: "View Variants" },
  { icon: Target, label: "View Objectives" },
  { icon: Users, label: "View Contributors" },
  { icon: History, label: "View Revisions" },
];

function useVote() {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const toggleVote = (type: "up" | "down") => {
    setVote((current) => (current === type ? null : type));
  };

  return {
    vote,
    upvote: () => toggleVote("up"),
    downvote: () => toggleVote("down"),
  };
}

export const Route = createFileRoute("/guides/$slug/$variantSlug/")({
  loader: async ({ params, abortController }) => {
    try {
      const variant = await getVariantBySlug(params.slug, params.variantSlug, {
        signal: abortController.signal,
      });
      if (!variant.current) throw notFound();

      return { variant, current: variant.current };
    } catch {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug, variantSlug } = Route.useParams();
  const { variant, current } = Route.useLoaderData();

  const { vote, upvote, downvote } = useVote();

  const breadcrumbOrigin = useLocation({
    select: (location) => location.state.breadcrumbOrigin,
  });

  const guide = {
    slug,
    variant_slug: variant.slug,
    title: current.title ?? "",
    author: variant.author,
    summary: current.summary,
    body: current.body,
    duration_minutes: variant.duration_minutes,
    created_at: current.created_at,
    tags: variant.tags,
    prerequisites: [],
  };

  const guideMenuItems = [
    {
      label: "Edit Variant",
      to: `/guides/${slug}/${variantSlug}/edit`,
      icon: <Pencil className="h-4 w-4" />,
    },
    {
      label: "Create Variant",
      to: "/contribute",
      icon: <Plus className="h-4 w-4" />,
    },
  ];

  const breadcrumbs = buildBreadcrumbs(guide.title, breadcrumbOrigin);

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-7xl border-x bg-background">
      <section className="grid grid-cols-[320px_1fr] border-b">
        <GuideSidebar
          sidebarActions={
            <div className="flex items-center justify-start gap-4">
              {SIDEBAR_ACTIONS.map((action: Action) => (
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
          guide={guide}
          slug={slug}
          showPrerequisites={false}
        />

        {/* MAIN */}
        <main className="h-[calc(100vh-70px)] min-w-0 overflow-y-auto px-10 py-4 lg:px-16">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <ul className="flex min-w-0 flex-nowrap items-center gap-2 text-xs tracking-[0.08em] text-muted-foreground uppercase">
              {breadcrumbs.map((crumb, idx) => (
                <li
                  key={`${crumb.label}-${idx}`}
                  className="mono-micro flex min-w-0 items-center gap-2"
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
                        <span className="max-w-[30ch] truncate">
                          {crumb.label}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <span className="max-w-[30ch] truncate">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span className="shrink-0">/</span>
                  )}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="lg" onClick={() => upvote()}>
                <ArrowBigUp
                  className="h-4 w-4"
                  color={vote == "up" ? "#3D80DD" : "#000000"}
                  fill={vote == "up" ? "#3D80DD" : "#FFFFFF"}
                />
                <span className="mono-micro">{variant.votes.up}</span>
              </Button>

              <Button variant="outline" size="lg" onClick={() => downvote()}>
                <ArrowBigDown
                  className="h-4 w-4"
                  color={vote == "down" ? "#3D80DD" : "#000000"}
                  fill={vote == "down" ? "#3D80DD" : "#FFFFFF"}
                />
                <span className="mono-micro">{variant.votes.down}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md"
                  >
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 font-mono">
                  {guideMenuItems.map((item) => (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to} className="text-xs">
                        {item.icon}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Separator className="mb-8" />

          <GuideReader guide={guide} />
        </main>
      </section>
    </div>
  );
}
