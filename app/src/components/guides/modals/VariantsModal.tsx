import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, GitFork, Sparkles } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideVariantListItem } from "@bluelearn/schemas";
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
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Guide Variants"
      description="Alternative approaches, methods, and explanations for this guide."
      icon={<GitFork className="h-4 w-4 text-primary" />}
      loading={loading}
      loadingText="Loading variants..."
      error={error}
      isEmpty={variants.length === 0}
      emptyIcon={<Sparkles className="h-6 w-6" />}
      emptyTitle="No other variants available"
      emptyDescription="This guide currently only has its canonical version."
      emptyAction={
        <Link
          to="/contribute"
          className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
          onClick={() => onOpenChange(false)}
        >
          Create a variant
        </Link>
      }
    >
      {variants.map((variant) => {
        const isCurrent =
          Boolean(currentVariantSlug) && variant.slug === currentVariantSlug;

        return (
          <div
            key={variant.id || variant.slug}
            onClick={() => handleSelectVariant(variant.slug)}
            className={`group relative flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border p-3.5 transition-colors ${
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
      })}
    </BaseGuideModal>
  );
}
