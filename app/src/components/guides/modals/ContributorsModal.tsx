import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, User, Users } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideContributor } from "@bluelearn/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGuideContributors } from "@/lib/api/guides";

type ContributorsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
};

function getInitials(name?: string | null, username?: string): string {
  const display = name || username || "";
  if (!display) return "U";
  const parts = display.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return display.slice(0, 2).toUpperCase();
}

export function ContributorsModal({
  open,
  onOpenChange,
  slug,
}: ContributorsModalProps) {
  const [contributors, setContributors] = useState<Array<GuideContributor>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getGuideContributors(slug)
      .then((res) => {
        if (!ignore) {
          setContributors(res.contributors);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load contributors", err);
          setError("Failed to load contributors. Please try again.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [open, slug]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Guide Contributors"
      description="Authors and editors who created revisions and variants for this guide."
      icon={<Users className="h-4 w-4 text-primary" />}
      loading={loading}
      loadingText="Loading contributors..."
      error={error}
      isEmpty={contributors.length === 0}
      emptyIcon={<User className="h-6 w-6" />}
      emptyTitle="No contributors found"
      emptyDescription="No authors have been credited for this guide yet."
    >
      {contributors.map((contributor) => (
        <Link
          key={contributor.id || contributor.username}
          to="/profile"
          search={{
            username: contributor.username,
          }}
          onClick={() => onOpenChange(false)}
          className="group flex w-full items-center justify-between rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {contributor.avatar_url && (
                <AvatarImage
                  src={contributor.avatar_url}
                  alt={contributor.username}
                />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(contributor.name, contributor.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-foreground group-hover:text-primary">
                @{contributor.username}
              </p>
              {contributor.name && (
                <p className="text-[11px] text-muted-foreground">
                  {contributor.name}
                </p>
              )}
            </div>
          </div>

          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      ))}
    </BaseGuideModal>
  );
}
