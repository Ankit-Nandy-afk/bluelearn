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
import { getGuide, getVariantId } from "@/lib/api/guides";

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

import { Route as GuideWalkthroughRoute } from "@/routes/guides/$slug/walkthrough";
import { getAuthToken } from "@/lib/auth";

const SIDEBAR_ACTIONS: Array<Action> = [
  { icon: Replace, label: "View Variants" },
  { icon: Target, label: "View Objectives" },
  { icon: Users, label: "View Contributors" },
  { icon: History, label: "View Revisions" },
];

function useVote(slug: string) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const thisSlug = slug;

  const toggleVote = async (type: "up" | "down") => {
    const prev = vote;
    const next = prev === type ? null : type;

    // Display vote on frontend before updating database for better UX
    setVote(next);

    const token = await getAuthToken();

    if (!token) {
      // TODO: Add a notice saying user is not authorized or signed in!
      console.error("Unauthorized");
      setVote(prev);
    }

    // Payload to update user vote in database
    const payload: {
      method: string | undefined;
      direction: string | undefined;
      headers: {
        Authorization: string;
      };
    } = {
      method: undefined,
      direction: undefined,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    switch (next) {
      case null:
        // DELETE retracts the vote
        payload.method = "DELETE";
        payload.direction = undefined;
        break;
      case "up":
        payload.method = "PUT";
        payload.direction = "up";
        break;
      case "down":
        payload.method = "PUT";
        payload.direction = "down";
        break;
      default:
        console.error("Invalid vote selected");
        break;
    }

    const variantId = await getVariantId(thisSlug);
    const api = import.meta.env.VITE_API_BASE;
    const votingApi = `${api}/variants/${variantId}/vote`;

    const responseBody = JSON.stringify({
      direction: payload.direction,
      reason: undefined,
      note: undefined,
    });

    const response = await fetch(votingApi, {
      method: payload.method,
      headers: {
        ...payload.headers,
        "Content-Type": "application/json",
      },
      body: responseBody,
    });

    if (!response.ok) {
      // TODO: Add user pop up showing that vote failed to be uploaded
      console.log("Unable to update vote. vote:", payload.direction);

      const errorBody = await response.json().catch(() => null);
      console.error("Vote request failed:", response.status, errorBody);

      setVote(prev);
    }
  };

  return {
    vote,
    upvote: () => toggleVote("up"),
    downvote: () => toggleVote("down"),
  };
}

export const Route = createFileRoute("/guides/$slug/")({
  loader: async ({ params, abortController }) => {
    try {
      return await getGuide(params.slug, { signal: abortController.signal });
    } catch {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const guide = Route.useLoaderData();

  const { vote, upvote, downvote } = useVote();

  const breadcrumbOrigin = useLocation({
    select: (location) => location.state.breadcrumbOrigin,
  });

  const guideMenuItems = [
    {
      label: "Edit Guide",
      to: `/guides/${slug}/${guide.variant_slug}/edit`,
      icon: <Pencil className="h-4 w-4" />,
    },
    {
      label: "Create Variant",
      to: "/contribute",
      icon: <Plus className="h-4 w-4" />,
    },
    // { label: "Report", to: "/report", <Flag className="h-4 w-4" /> },// TODO: Implement post v1
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
              <Link
                to={GuideWalkthroughRoute.to}
                params={{ slug: slug }}
                state={{ breadcrumbOrigin }}
                className="btn-outline"
              >
                View Walkthrough
              </Link>

              <Button variant="outline" size="lg" onClick={() => upvote()}>
                <ArrowBigUp
                  className="h-4 w-4"
                  color={vote == "up" ? "#3D80DD" : "#000000"}
                  fill={vote == "up" ? "#3D80DD" : "#FFFFFF"}
                />
              </Button>

              <Button variant="outline" size="lg" onClick={() => downvote()}>
                <ArrowBigDown
                  className="h-4 w-4"
                  color={vote == "down" ? "#3D80DD" : "#000000"}
                  fill={vote == "down" ? "#3D80DD" : "#FFFFFF"}
                />
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

          {/* Header */}

          <GuideReader guide={guide} />
        </main>
      </section>
    </div>
  );
}
