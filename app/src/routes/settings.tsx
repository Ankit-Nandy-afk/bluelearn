import { Outlet, createFileRoute } from "@tanstack/react-router";
import {
  SettingsSidebar,
  SettingsTabs,
} from "@/components/sidebar/SettingsSidebar";
import { requireSession } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  ssr: false,
  beforeLoad: requireSession,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-[1280px] bg-background">
      <div className="flex min-h-[calc(100svh_-_64px)]">
        {/* Left Sidebar Navigation */}
        <SettingsSidebar />
        <div className="hidden w-64 shrink-0 md:block" />

        {/* Right Content Area */}
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 md:border-l lg:px-16">
          <SettingsTabs />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
