import { Outlet, createFileRoute } from "@tanstack/react-router";

import { useRequireRole } from "@/lib/authContext";
import { NotFound } from "@/components/NotFound";

export const Route = createFileRoute("/review")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const access = useRequireRole("verifier");
  if (access === "pending") return null;
  if (access === "not-found") return <NotFound />;

  return <Outlet />;
}
