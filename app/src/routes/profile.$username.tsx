import { Link, createFileRoute } from "@tanstack/react-router";
import { Calendar, Settings } from "lucide-react";
import { getPublicProfile } from "@/lib/api/identity";
import { getInitials } from "@/lib/profile";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/guideUtils";

export const Route = createFileRoute("/profile/$username")({
  loader: ({ params, abortController }) =>
    getPublicProfile(params.username, { signal: abortController.signal }),
  pendingComponent: () => <ProfileMessage>Loading profile...</ProfileMessage>,
  errorComponent: ({ error }) => (
    <ProfileMessage tone="error">{error.message}</ProfileMessage>
  ),
  component: PublicProfilePage,
});

function ProfileMessage({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <div className="mx-auto max-w-7xl border-x bg-background px-8 py-10 lg:px-16">
      <p
        className={
          tone === "error"
            ? "text-sm text-red-600"
            : "text-sm text-muted-foreground"
        }
      >
        {children}
      </p>
    </div>
  );
}

function PublicProfilePage() {
  const { profile, roles } = Route.useLoaderData();
  const { currentProfile, user } = useAuth();
  const isOwner = Boolean(
    (currentProfile &&
      currentProfile.username.toLowerCase() ===
        profile.username.toLowerCase()) ||
    (typeof user?.user_metadata.username === "string" &&
      user.user_metadata.username.toLowerCase() ===
        profile.username.toLowerCase())
  );
  const initials = getInitials(profile.display_name || profile.username);

  const formattedJoinedDate = profile.created_at
    ? formatDate(new Date(profile.created_at))
    : null;

  return (
    <div className="mx-auto max-w-7xl border-x bg-background">
      <section className="border-b px-8 py-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <Avatar className="size-28 shrink-0 bg-muted">
              <AvatarImage />
              <AvatarFallback className="bg-muted text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name ?? profile.username}
                  </h1>
                  <h2 className="mono-micro text-muted-foreground/80">
                    @{profile.username}
                  </h2>
                </div>

                {isOwner && (
                  <div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="btn-sec"
                    >
                      <Link to="/settings/profile">
                        <Settings className="mr-2 size-3.5" />
                        Edit profile
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {formattedJoinedDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Joined {formattedJoinedDate}</span>
                  </div>
                )}

                {roles.length > 0 && (
                  <ul className="flex flex-wrap items-center gap-2">
                    {roles.map((role) => (
                      <li key={role}>
                        <Badge
                          variant="outline"
                          className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
                        >
                          {role}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
