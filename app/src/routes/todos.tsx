import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { TodoCard } from "@/components/cards/TodoCard";

import { listTodos } from "@/lib/api/todos";
import { groupTodosByTitle } from "@/lib/groupTodos";

export const Route = createFileRoute("/todos")({
  loader: ({ abortController }) =>
    listTodos({ signal: abortController.signal }),
  errorComponent: TodosLoadError,
  component: RouteComponent,
});

function TodosLoadError() {
  return (
    <TodosPage>
      <p className="text-sm text-muted-foreground">
        Todos could not be loaded. Try again shortly.
      </p>
    </TodosPage>
  );
}

type TodosPageProps = {
  children: React.ReactNode;
};

const TodosPage = ({ children }: TodosPageProps) => {
  return (
    <div className="mx-auto max-w-[1280px] bg-background">
      <div className="px-8 py-8 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Guides Waiting To Be Written
          </h1>
        </div>

        <Separator className="mb-4 bg-border" />

        {children}
      </div>
    </div>
  );
};

function RouteComponent() {
  const todos = Route.useLoaderData();

  const groups = useMemo(() => groupTodosByTitle(todos), [todos]);

  if (groups.length === 0) {
    return (
      <TodosPage>
        <p className="text-sm text-muted-foreground">
          No todo guides right now.
        </p>
      </TodosPage>
    );
  }

  return (
    <TodosPage>
      <section className="grid gap-6 py-4 md:grid-cols-2">
        {groups.map((group) => (
          <TodoCard key={group.key} todo={group} />
        ))}
      </section>
    </TodosPage>
  );
}
