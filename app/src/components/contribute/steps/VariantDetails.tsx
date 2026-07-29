import type { Dispatch, SetStateAction } from "react";
import type { VariantContribution } from "@/types/contributions";
import type { listGuides } from "@/lib/api/guides";
import type { listSubjects } from "@/lib/api/subjects";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { StepperActionHeader } from "@/components/contribute/StepperActionHeader";

type PropTypes = {
  Stepper: any;
  variantContData: VariantContribution;
  setVariantContData: Dispatch<SetStateAction<VariantContribution>>;
  guides: Awaited<ReturnType<typeof listGuides>>;
  subjects: Awaited<ReturnType<typeof listSubjects>>;
  onSaveDraft: () => void;
  submitting?: boolean;
};

export const VariantDetails = ({
  Stepper,
  variantContData,
  setVariantContData,
  guides,
  subjects,
  onSaveDraft,
  submitting,
}: PropTypes) => {
  return (
    <Stepper.Content step="variant-details">
      <StepperActionHeader
        title={"Variant Details"}
        Stepper={Stepper}
        onSaveDraft={onSaveDraft}
        submitting={submitting}
      />

      <FieldGroup>
        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel
              required
              className="font-mono tracking-[0.08em] uppercase"
            >
              Title
            </FieldLabel>
            <FieldDescription className="text-xs">
              A clear, concise name for your variant.
            </FieldDescription>
          </div>

          <Input
            id="title"
            type="text"
            autoComplete="Title"
            maxLength={50}
            placeholder="Choose a title. (Maximum 50 characters)."
            className="h-10 rounded-md"
            required
            value={variantContData.title}
            onChange={(e) =>
              setVariantContData((prev: any) => ({
                ...prev,
                title: e.target.value,
              }))
            }
          />
        </Field>

        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel
              required
              className="font-mono tracking-[0.08em] uppercase"
            >
              Summary
            </FieldLabel>
            <FieldDescription className="text-xs">
              Briefly describe what makes this take on the topic different.
            </FieldDescription>
          </div>

          <textarea
            className="h-32 w-full min-w-0 resize-none rounded-md border border-input bg-input/20 p-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            rows={4}
            placeholder="Write a summary for your guide variant."
            required
            value={variantContData.summary}
            onChange={(e) =>
              setVariantContData((prev: any) => ({
                ...prev,
                summary: e.target.value,
              }))
            }
          />
        </Field>

        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel
              required
              className="font-mono tracking-[0.08em] uppercase"
            >
              Base Guide
            </FieldLabel>
            <FieldDescription className="text-xs">
              The existing guide your variant offers a different approach to.
            </FieldDescription>
          </div>

          <Combobox
            items={guides
              .filter((g): g is typeof g & { slug: string } => !!g.slug)
              .map((g) => {
                return {
                  value: g.slug,
                  label: g.title ?? g.slug,
                  description: g.summary ?? undefined,
                };
              })}
            value={variantContData.baseGuide}
            onValueChange={(baseGuide) =>
              setVariantContData((prev: any) => ({
                ...prev,
                baseGuide,
              }))
            }
          />
        </Field>
        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel
              required
              className="font-mono tracking-[0.08em] uppercase"
            >
              Subjects
            </FieldLabel>
            <FieldDescription className="text-xs">
              Select existing subjects. At least one is required.
            </FieldDescription>
          </div>

          <Combobox
            multiple
            items={subjects.map((s) => {
              return {
                value: s.slug,
                label: s.name,
                description: s.summary ?? "",
              };
            })}
            value={variantContData.subjects}
            onValueChange={(slugs) =>
              setVariantContData((prev: any) => ({
                ...prev,
                subjects: slugs,
              }))
            }
          />
        </Field>
      </FieldGroup>
    </Stepper.Content>
  );
};
