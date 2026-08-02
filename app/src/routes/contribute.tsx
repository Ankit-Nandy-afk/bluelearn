import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import type { ContributionType } from "@/types/contributions";
import ContributionFlow from "@/components/contribute/ContributionFlow";
import { RejectionFeedback } from "@/components/review/RejectionFeedback";
import { requireSession } from "@/lib/auth";

export const Route = createFileRoute("/contribute")({
  ssr: false,
  beforeLoad: requireSession,
  validateSearch: (
    search: Record<string, unknown>
  ): {
    draft?: string;
    kind?: "guide" | "objective";
    todoTitle?: string;
    todos?: string;
  } => ({
    draft: typeof search.draft === "string" ? search.draft : undefined,
    kind: search.kind === "objective" ? "objective" : undefined,
    todoTitle:
      typeof search.todoTitle === "string" ? search.todoTitle : undefined,
    todos: typeof search.todos === "string" ? search.todos : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { draft, kind, todoTitle, todos } = Route.useSearch();
  const [type, setType] = useState<ContributionType | null>(null);

  // A resumed draft already carries its claims in the database, so the todo page's
  // params only apply to a fresh start.
  const todoIds = draft || !todos ? [] : todos.split(",");

  return (
    <div className="mx-auto flex min-h-[max(calc(100vh-65px),750px)] w-full max-w-[1280px] flex-col border-x bg-background">
      <section className="relative flex min-h-0 flex-1 gap-8 border-b px-8 py-8 lg:px-16">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ContributionFlow
            type={type}
            setType={setType}
            draftId={draft}
            draftKind={kind}
            todoTitle={draft ? undefined : todoTitle}
            todoIds={todoIds}
          />
        </div>

        {draft && <RejectionFeedback draftId={draft} />}
      </section>
    </div>
  );
}
