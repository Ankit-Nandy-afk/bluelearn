import { Save, Scroll } from "lucide-react";

import { useState } from "react";
import type { ContributionType } from "@/types/contributions";
import { Separator } from "@/components/ui/separator";
import { GuidelinesModal } from "@/components/modals/GuidelinesModal";
import { GuideSubmitModal } from "@/components/modals/GuideSubmitModal";

type PropTypes = {
  title: string;
  Stepper: any;
  type?: ContributionType | null;
  nextDisabled?: boolean;
  hideBackBtn?: boolean;
  submitting?: boolean;
  saveDisabled?: boolean;
  publishLabel?: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
};

export const StepperActionHeader = ({
  title,
  Stepper,
  type,
  nextDisabled,
  submitting,
  saveDisabled,
  publishLabel = "Submit for Review",
  hideBackBtn,
  onSaveDraft,
  onPublish,
}: PropTypes) => {
  const [openGuidelineModal, setOpenGuidelineModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const toggleGuidelineModal = () => setOpenGuidelineModal(!openGuidelineModal);
  const toggleSubmitModal = () => setShowSubmitModal(!showSubmitModal);

  const handleSubmit = () => setShowSubmitModal(!showSubmitModal);

  console.log(type);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            {title}
          </h1>

          {type != "objective" && (
            <button
              type="button"
              className="btn-sec inline-flex items-center gap-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={toggleGuidelineModal}
            >
              <Scroll className="size-4" />
              View Guidelines
            </button>
          )}
        </div>

        <div className="text-mono flex items-center justify-between gap-4">
          {onSaveDraft && (
            <button
              type="button"
              className="btn-sec inline-flex items-center gap-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={submitting || saveDisabled}
              onClick={onSaveDraft}
            >
              <Save className="size-4" />
              Save Draft
            </button>
          )}

          {!hideBackBtn && (
            <Stepper.Prev className="btn-sec">Back</Stepper.Prev>
          )}

          {onPublish ? (
            <button
              type="button"
              className="btn-pri disabled:pointer-events-none disabled:opacity-50"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {publishLabel}
            </button>
          ) : (
            <Stepper.Next className="btn-pri" disabled={nextDisabled}>
              Next
            </Stepper.Next>
          )}
        </div>
      </div>

      <Separator className="mb-8 bg-border" />

      <GuidelinesModal
        open={openGuidelineModal}
        onOpenChange={toggleGuidelineModal}
      />

      <GuideSubmitModal
        open={showSubmitModal}
        onOpenChange={toggleSubmitModal}
        submitting={submitting}
        onPublish={onPublish}
      />
    </>
  );
};
