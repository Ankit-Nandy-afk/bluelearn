import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, GitFork, Loader2, Sparkles } from "lucide-react";
import type { GuideVariantListItem } from "@bluelearn/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getGuideVariants } from "@/lib/api/guides";

type VariantsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  currentVariantSlug?: string | null;
};

export function VariantsModal({
  open,
  onOpenChange,
  slug,
  currentVariantSlug,
}: VariantsModalProps) {
  const [variants, setVariants] = useState<Array<GuideVariantListItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getGuideVariants(slug)
      .then((res) => {
        if (!ignore) {
          setVariants(res.variants);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load variants", err);
          setError("Failed to load variants. Please try again.");
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

  const handleSelectVariant = (variantSlug: string) => {
    onOpenChange(false);
    navigate({
      to: "/guides/$slug",
      params: { slug },
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        variant: variantSlug,
      }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-primary" />
            <DialogTitle>Guide Variants</DialogTitle>
          </div>
          <DialogDescription>
            Alternative approaches, methods, and explanations for this guide.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading variants...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : variants.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                No other variants available
              </p>
              <p className="mt-1 text-xs">
                This guide currently only has its canonical version.
              </p>
              <div className="mt-4">
                <Link
                  to="/contribute"
                  className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  onClick={() => onOpenChange(false)}
                >
                  Create a variant
                </Link>
              </div>
            </div>
          ) : (
            variants.map((variant) => {
              const isCurrent =
                Boolean(currentVariantSlug) &&
                variant.slug === currentVariantSlug;

              return (
                <div
                  key={variant.id || variant.slug}
                  onClick={() => handleSelectVariant(variant.slug)}
                  className={`group relative flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3.5 transition-colors ${
                    isCurrent
                      ? "border-primary/50 bg-primary/5"
                      : "hover:border-primary/40 hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-medium text-foreground group-hover:text-primary">
                      {variant.title}
                    </h4>
                    {isCurrent && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <Check className="h-3 w-3 text-primary" />
                        Current
                      </Badge>
                    )}
                  </div>
                  {variant.summary && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {variant.summary}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
