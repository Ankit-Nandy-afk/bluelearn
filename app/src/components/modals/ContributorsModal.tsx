import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, User } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideContributor } from "@bluelearn/schemas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getVariantContributors } from "@/lib/api/variants";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string | null;
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

export const ContributorsModal = ({
  open,
  onOpenChange,
  variantId,
}: PropsTypes) => {
  const [contributors, setContributors] = useState<Array<GuideContributor>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !variantId) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getVariantContributors(variantId)
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
  }, [open, variantId]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Guide Contributors"
      description="Authors and editors who created revisions and variants for this guide."
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
};
