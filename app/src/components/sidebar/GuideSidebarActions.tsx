import { useState } from "react";

import type { GuideModalType } from "@/components/GuideActionModals";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GuideActionModals,
  guideActions,
} from "@/components/GuideActionModals";

type PropsTypes = {
  slug: string;
  currentVariantSlug: string | null;
  variantId: string | null;
  isOfficial?: boolean;
};

export const GuideSidebarActions = ({
  slug,
  currentVariantSlug,
  variantId,
  isOfficial = false,
}: PropsTypes) => {
  const [activeModal, setActiveModal] = useState<GuideModalType | null>(null);
  const close = (open: boolean) => !open && setActiveModal(null);

  return (
    <>
      <div className="flex items-center justify-start gap-4">
        {guideActions(isOfficial).map((action) => (
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
        isOfficial={isOfficial}
      />
    </>
  );
};
