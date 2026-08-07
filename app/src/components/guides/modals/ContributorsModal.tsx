import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, User } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideContributor } from "@bluelearn/schemas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ContributorsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchContributors: (
    signal?: AbortSignal
  ) => Promise<{ contributors: Array<GuideContributor> }>;
  enabled?: boolean;
  title?: string;
  description?: string;
  emptyDescription?: string;
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
  fetchContributors,
  enabled = true,
  title = "Guide Contributors",
  description = "Authors and editors who created revisions and variants for this guide.",
  emptyDescription = "No authors have been credited for this guide yet.",
}: ContributorsModalProps) {
  const [contributors, setContributors] = useState<Array<GuideContributor>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef(fetchContributors);
  fetchRef.current = fetchContributors;

  useEffect(() => {
    if (!open || !enabled) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    fetchRef
      .current()
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
  }, [open, enabled]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      loading={loading}
      loadingText="Loading contributors..."
      error={error}
      isEmpty={contributors.length === 0}
      emptyIcon={<User className="h-6 w-6" />}
      emptyTitle="No contributors found"
      emptyDescription={emptyDescription}
    >
      {contributors.map((contributor) => (
        <Link
          key={contributor.id || contributor.username}
          to="/profile/$username"
          params={{ username: contributor.username }}
          onClick={() => onOpenChange(false)}
          className="group flex w-full items-center justify-between rounded-lg border border-border bg-card p-3.5 transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="mono-micro text-xs text-muted-foreground">
                {getInitials(contributor.name, contributor.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-foreground">
                @{contributor.username}
              </p>
              {contributor.name && (
                <p className="text-[11px] text-muted-foreground">
                  {contributor.name}
                </p>
              )}
            </div>
          </div>

          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>
      ))}
    </BaseGuideModal>
  );
}
