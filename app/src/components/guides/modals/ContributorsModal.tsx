import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Loader2, User, Users } from "lucide-react";
import type { GuideContributor } from "@bluelearn/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <DialogTitle>Guide Contributors</DialogTitle>
          </div>
          <DialogDescription>
            Authors and editors who created revisions and variants for this
            guide.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading contributors...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : contributors.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <User className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                No contributors found
              </p>
              <p className="mt-1 text-xs">
                No authors have been credited for this guide yet.
              </p>
            </div>
          ) : (
            contributors.map((contributor) => (
              <Link
                key={contributor.id || contributor.username}
                to="/profile"
                search={{
                  username: contributor.username,
                }}
                onClick={() => onOpenChange(false)}
                className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
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
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
