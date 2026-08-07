import "katex/dist/katex.min.css";

import type { Guide } from "@bluelearn/schemas";
import type { GuideType } from "@/types/guides";

import { GuideReader } from "@/components/GuideReader";
import { StepperActionHeader } from "@/components/contribute/StepperActionHeader";

type PropTypes = {
  Stepper: any;
  guide: Guide;
  guideType?: GuideType;
  onSaveDraft: () => void;
  onPublish: () => void;
  submitting: boolean;
  title?: string;
  publishLabel?: string;
  saveDisabled?: boolean;
};

export const Submit = ({
  Stepper,
  guide,
  guideType,
  onSaveDraft,
  onPublish,
  submitting,
  title = "Preview",
  publishLabel = "Submit for Review",
  saveDisabled,
}: PropTypes) => {
  return (
    <Stepper.Content step="submit">
      <StepperActionHeader
        title={title}
        Stepper={Stepper}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        submitting={submitting}
        publishLabel={publishLabel}
        saveDisabled={saveDisabled}
      />

      <GuideReader guide={guide} guideType={guideType} />
    </Stepper.Content>
  );
};