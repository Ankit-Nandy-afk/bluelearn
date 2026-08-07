import type { Dispatch, SetStateAction } from "react";

import { BaseGuideModal } from "@/components/modals/BaseGuideModal";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceptGuidelines: boolean;
  setAcceptGuidelines: Dispatch<SetStateAction<boolean>>;
};

export const GuideSubmitModal = ({
  open,
  onOpenChange,
  acceptGuidelines,
  setAcceptGuidelines,
}: PropsTypes) => {
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
      </Field>
    </BaseGuideModal>
  );
};
