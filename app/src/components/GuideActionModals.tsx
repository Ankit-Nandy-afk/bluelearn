import { useCallback } from "react";
import { History, Replace, Target, Users } from "lucide-react";

import {
  getVariantContributors,
  getVariantRevisions,
} from "@/lib/api/variants";
import { VariantsModal } from "@/components/modals/VariantsModal";
import { ObjectivesModal } from "@/components/modals/ObjectivesModal";
import { ContributorsModal } from "@/components/modals/ContributorsModal";
import { RevisionsModal } from "@/components/modals/RevisionsModal";

export type GuideModalType =
  | "variants"
  | "objectives"
  | "contributors"
  | "revisions";

export const GUIDE_ACTIONS: Array<{
  icon: typeof Replace;
  label: string;
  type: GuideModalType;
}> = [
  { icon: Replace, label: "View Variants", type: "variants" },
  { icon: Target, label: "View Objectives", type: "objectives" },
  { icon: Users, label: "View Contributors", type: "contributors" },
  { icon: History, label: "View Revisions", type: "revisions" },
];

type GuideActionModalsProps = {
  active: GuideModalType | null;
  onOpenChange: (open: boolean) => void;
  slug: string;
  currentVariantSlug: string | null;
  variantId: string | null;
};

export function GuideActionModals({
  active,
  onOpenChange,
  slug,
  currentVariantSlug,
  variantId,
}: GuideActionModalsProps) {
  const fetchContributors = useCallback(
    () => getVariantContributors(variantId ?? ""),
    [variantId]
  );

  const fetchRevisions = useCallback(async () => {
    const { revisions } = await getVariantRevisions(variantId ?? "");
    return revisions.map((rev) => ({
      id: rev.id,
      change_summary: rev.change_summary,
      author: rev.author,
      date: rev.approved_at,
    }));
  }, [variantId]);

  return (
    <>
      <VariantsModal
        open={active === "variants"}
        onOpenChange={onOpenChange}
        slug={slug}
        currentVariantSlug={currentVariantSlug}
      />

      <ObjectivesModal
        open={active === "objectives"}
        onOpenChange={onOpenChange}
        slug={slug}
      />

      <ContributorsModal
        open={active === "contributors"}
        onOpenChange={onOpenChange}
        fetchContributors={fetchContributors}
        enabled={Boolean(variantId)}
      />

      <RevisionsModal
        open={active === "revisions"}
        onOpenChange={onOpenChange}
        fetchRevisions={fetchRevisions}
        enabled={Boolean(variantId)}
        linkTo={(rev) =>
          currentVariantSlug
            ? {
                to: "/guides/$slug/$variantSlug/revisions/$revisionId",
                params: {
                  slug,
                  variantSlug: currentVariantSlug,
                  revisionId: rev.id,
                },
              }
            : null
        }
      />
    </>
  );
}
