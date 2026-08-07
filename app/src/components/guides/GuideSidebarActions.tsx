import { useState } from "react";

import type { GuideModalType } from "@/components/guides/GuideActionModals";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GUIDE_ACTIONS,
  GuideActionModals,
} from "@/components/guides/GuideActionModals";

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
  const [activeModal, setActiveModal] = useState<GuideModalType | null>(null);
  const close = (open: boolean) => !open && setActiveModal(null);

  return (
    <>
      <div className="flex items-center justify-start gap-4">
        {GUIDE_ACTIONS.map((action) => (
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

      <GuideActionModals
        active={activeModal}
        onOpenChange={close}
        slug={slug}
        currentVariantSlug={currentVariantSlug}
        variantId={variantId}
      />
    </>
  );
}
