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
};

export const PreviewGuide = ({
  Stepper,
  guide,
  guideType,
  onSaveDraft,
  onPublish,
  submitting,
}: PropTypes) => {
  return (
    <Stepper.Content step="preview-guide">
      <StepperActionHeader
        title={"Preview"}
        Stepper={Stepper}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        submitting={submitting}
      />

      <GuideReader guide={guide} guideType={guideType} />
    </Stepper.Content>
  );
};
