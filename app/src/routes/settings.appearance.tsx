import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/settings/appearance")({
  component: RouteComponent,
});

const APPEARANCE_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function RouteComponent() {
  const [appearance, setAppearance] = useState("light");

  return (
    <div className="mb-6">
      <div>
        <h1 className="data-label text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          Appearance
        </h1>
      </div>

      <Separator className="mb-8 bg-border" />

      <RadioGroup value={appearance} onValueChange={setAppearance}>
        {APPEARANCE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <FieldLabel
              htmlFor={option.value}
              className="font-mono tracking-[0.08em] uppercase"
            >
              {option.label}
            </FieldLabel>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
