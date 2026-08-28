import "katex/dist/katex.min.css";

import type { GuideType } from "@/types/guides";
import type { ContributionType } from "@/types/contributions";
import type { ReaderGuide } from "@/components/GuideReader";
import { GuideReader } from "@/components/GuideReader";
import { StepperActionHeader } from "@/components/contribute/StepperActionHeader";

type PropTypes = {
  Stepper: any;
  type: ContributionType | null;
  guide: ReaderGuide;
  guideType?: GuideType;
  onSaveDraft: () => void;
  onPublish: () => void;
  submitting: boolean;
};

export const PreviewGuide = ({
  Stepper,
  type,
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
        type={type}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        submitting={submitting}
      />

      <GuideReader guide={guide} guideType={guideType} />
    </Stepper.Content>
  );
};
