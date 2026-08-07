import { useState } from "react";

import { BaseGuideModal } from "@/components/modals/BaseGuideModal";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean | undefined;
  onPublish: (() => void) | undefined;
};

export const GuideSubmitModal = ({
  open,
  onOpenChange,
  submitting,
  onPublish,
}: PropsTypes) => {
  const [acceptGuidelines, setAcceptGuidelines] = useState(false);

  const handleSubmit = () => {
    if (onPublish && acceptGuidelines) {
      onPublish();
    }
  };

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Are you sure you want to submit?"
    >
      <Field orientation="horizontal" className="flex items-center">
        <Checkbox
          id="guidelines-checkbox"
          name="guidelines-checkbox"
          className="border-primary"
          checked={acceptGuidelines}
          onCheckedChange={(isTicked) => setAcceptGuidelines(isTicked === true)}
        />

        <FieldLabel htmlFor="policies-checkbox" className="block">
          I have read and agree that I have followed the Guide Guidelines
        </FieldLabel>

        <button
          type="button"
          className="btn-pri disabled:pointer-events-none disabled:opacity-50"
          disabled={submitting || !acceptGuidelines}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </Field>
    </BaseGuideModal>
  );
};
