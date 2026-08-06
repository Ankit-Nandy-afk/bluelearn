import type { ComboboxItem } from "@/components/ui/combobox";

export const downvoteReasons: Array<ComboboxItem> = [
  {
    value: "unclear",
    label: "Unclear",
    description: "Explanation is confusing or hard to follow",
  },
  {
    value: "factually_wrong",
    label: "Factually Wrong",
    description: "Information contradicts verified information",
  },
  {
    value: "missing_step",
    label: "Missing Step",
    description: "A necessary action or concept is skipped",
  },
  {
    value: "outdated",
    label: "Outdated",
    description: "Information is no longer accurate or current",
  },
  {
    value: "broken_link",
    label: "Broken Link",
    description: "Referenced links are inaccessible",
  },
  {
    value: "prereq_gap",
    label: "Prerequisite Gap",
    description: "Assumes knowledge not covered in listed prerequisites",
  },
  {
    value: "wrong_level",
    label: "Wrong Level",
    description: "Difficulty does not match the stated proficiency level",
  },
  {
    value: "scope_creep",
    label: "Scope Creep",
    description: "Includes unnecessary details beyond the main topic",
  },
];
