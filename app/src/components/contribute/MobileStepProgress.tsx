type Step = {
  id: string;
  title: string;
};

type PropTypes = {
  steps: ReadonlyArray<Step>;
  activeStep: string;
};

export function MobileStepProgress({ steps, activeStep }: PropTypes) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep)
  );
  const currentStep = steps[activeIndex];
  const progress = steps.length
    ? Math.round(((activeIndex + 1) / steps.length) * 100)
    : 0;

  return (
    <div className="sm:hidden">
      <div className="mono-micro text-muted-foreground">
        Step {activeIndex + 1} of {steps.length}
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Contribution progress"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={activeIndex + 1}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        {currentStep.title}
      </h1>
    </div>
  );
}
