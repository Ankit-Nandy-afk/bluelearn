import { Check, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Separator } from "@/components/ui/separator";

type PropTypes = {
  title: string;
  Stepper: any;
  nextDisabled?: boolean;
  hideBackBtn?: boolean;
  submitting?: boolean;
  saveDisabled?: boolean;
  publishLabel?: string;
  onSaveDraft?: () => void | boolean | Promise<void | boolean>;
  onPublish?: () => void;
};

export const StepperActionHeader = ({
  title,
  Stepper,
  nextDisabled,
  submitting,
  saveDisabled,
  publishLabel = "Submit for Review",
  hideBackBtn,
  onSaveDraft,
  onPublish,
}: PropTypes) => {
  const [saved, setSaved] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const saveDraft = async () => {
    if (!onSaveDraft) return;

    const didSave = await onSaveDraft();
    if (didSave === false) return;

    setSaved(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="mb-4 hidden items-center justify-between sm:flex">
        <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h1>

        <div className="text-mono flex flex-wrap gap-2 sm:gap-4">
          {onSaveDraft && (
            <button
              type="button"
              className="btn-sec inline-flex items-center gap-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={submitting || saveDisabled}
              onClick={saveDraft}
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
              onClick={onPublish}
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

      <Separator className="mb-8 hidden bg-border sm:block" />

      {(onSaveDraft || !hideBackBtn || onPublish) && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
          <div className="justify-self-start">
            {!hideBackBtn && (
              <Stepper.Prev className="btn-sec min-w-20">Back</Stepper.Prev>
            )}
          </div>

          <div className="justify-self-center">
            {onSaveDraft && (
              <button
                type="button"
                className="inline-flex min-w-24 items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold text-muted-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled={submitting || saveDisabled}
                onClick={saveDraft}
              >
                {saved ? (
                  <>
                    <Check className="size-3.5" />
                    Draft saved
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save draft
                  </>
                )}
              </button>
            )}
          </div>

          <div className="justify-self-end">
            {onPublish ? (
              <button
                type="button"
                className="btn-pri disabled:pointer-events-none disabled:opacity-50"
                disabled={submitting}
                onClick={onPublish}
              >
                {publishLabel.toLowerCase().startsWith("submit")
                  ? "Submit"
                  : publishLabel}
              </button>
            ) : (
              <Stepper.Next className="btn-pri" disabled={nextDisabled}>
                Next
              </Stepper.Next>
            )}
          </div>
        </div>
      )}
    </>
  );
};
