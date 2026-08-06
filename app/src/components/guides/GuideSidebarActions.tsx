import { useState } from "react";
import { History, Replace, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VariantsModal } from "@/components/guides/modals/VariantsModal";
import { ObjectivesModal } from "@/components/guides/modals/ObjectivesModal";
import { ContributorsModal } from "@/components/guides/modals/ContributorsModal";
import { RevisionsModal } from "@/components/guides/modals/RevisionsModal";

type ModalType = "variants" | "objectives" | "contributors" | "revisions";

const ACTIONS: Array<{
  icon: typeof Replace;
  label: string;
  type: ModalType;
}> = [
  { icon: Replace, label: "View Variants", type: "variants" },
  { icon: Target, label: "View Objectives", type: "objectives" },
  { icon: Users, label: "View Contributors", type: "contributors" },
  { icon: History, label: "View Revisions", type: "revisions" },
];

type GuideSidebarActionsProps = {
  slug: string;
  currentVariantSlug: string | null;
  variantId: string | null;
};

export function GuideSidebarActions({
  slug,
  currentVariantSlug,
  variantId,
}: GuideSidebarActionsProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const close = (open: boolean) => !open && setActiveModal(null);

  return (
    <>
      <div className="flex items-center justify-start gap-4">
        {ACTIONS.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveModal(action.type)}
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <VariantsModal
        open={activeModal === "variants"}
        onOpenChange={close}
        slug={slug}
        currentVariantSlug={currentVariantSlug}
      />

      <ObjectivesModal
        open={activeModal === "objectives"}
        onOpenChange={close}
        slug={slug}
      />

      <ContributorsModal
        open={activeModal === "contributors"}
        onOpenChange={close}
        variantId={variantId}
      />

      <RevisionsModal
        open={activeModal === "revisions"}
        onOpenChange={close}
        slug={slug}
        variantSlug={currentVariantSlug}
        variantId={variantId}
      />
    </>
  );
}
