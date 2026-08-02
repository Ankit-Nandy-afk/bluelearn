import { Link } from "@tanstack/react-router";

import type { TodoGroup } from "@/lib/groupTodos";
import { Route as GuideRoute } from "@/routes/guides/$slug/index";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/cards/Footer";

type PropTypes = {
  todo: TodoGroup;
};

const requestLabel = (count: number) =>
  count === 1 ? "1 request" : `${count} requests`;

const claimNotice = (count: number) =>
  count === 1
    ? "Someone is currently drafting a guide for this topic."
    : `${count} people are currently drafting a guide for this topic.`;

export const TodoCard = ({ todo }: PropTypes) => {
  return (
    <Card className="flex h-full flex-col justify-between rounded-md bg-background shadow-none">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            To Do
          </p>
          <Badge
            variant="default"
            className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
          >
            {requestLabel(todo.todoIds.length)}
          </Badge>
        </div>

        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight">
          {todo.title}
        </h3>

        {todo.requestedBy.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="mono-micro text-muted-foreground">Requested by</p>
            <ul className="flex flex-col gap-1 text-sm">
              {todo.requestedBy.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    to={GuideRoute.to}
                    params={{ slug: guide.slug }}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {guide.title ?? guide.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {todo.claimCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {claimNotice(todo.claimCount)} You can still create one if you think
            yours will be different.
          </p>
        )}
      </CardHeader>

      <Footer
        data={{
          actionBtns: (
            <div className="col-span-2 col-start-3 flex items-center justify-around p-4">
              <Link
                to="/contribute"
                search={{
                  todoTitle: todo.title,
                  todos: todo.todoIds.join(","),
                }}
                className="btn-cta tracking-[0.08em]"
              >
                Write Guide
              </Link>
            </div>
          ),
        }}
      />
    </Card>
  );
};
