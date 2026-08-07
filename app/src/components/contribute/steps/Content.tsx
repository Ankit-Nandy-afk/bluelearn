import { Suspense, lazy, useEffect, useState } from "react";
import type { ContributionType } from "@/types/contributions";
import { StepperActionHeader } from "@/components/contribute/StepperActionHeader";

const Editor = lazy(() => import("../editor/Editor"));

type PropTypes = {
  Stepper: any;
  type: ContributionType | null;
  body: string;
  onBodyChange: (body: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  onSaveDraft: () => void;
  submitting?: boolean;
  title?: string;
  saveDisabled?: boolean;
};

export const Content = ({
  Stepper,
  type,
  body,
  onBodyChange,
  onUploadImage,
  onSaveDraft,
  submitting,
  title = "Content",
  saveDisabled,
}: PropTypes) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Stepper.Content step="content">
      <StepperActionHeader
        title={title}
        Stepper={Stepper}
        onSaveDraft={onSaveDraft}
        submitting={submitting}
        type={type}
        saveDisabled={saveDisabled}
      />
      {mounted && (
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Loading Editor...
            </div>
          }
        >
          <Editor
            value={body}
            onChange={onBodyChange}
            onUploadImage={onUploadImage}
          />
        </Suspense>
      )}
    </Stepper.Content>
  );
};