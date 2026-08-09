import type { ComboboxItem } from "@/components/ui/combobox";
import { getAuthToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

// Submits a vote for variantId. Returns the vote submitted
// If submission fails, return the vote passed in
export const submitVote = async (
  variantId: string,
  nextVote: string | null,
  reason: string | null = null,
  note: string | null = null,
  previousVote: string | null = null
) => {
  const token = await getAuthToken();
  if (!token) {
    console.error("Unauthorized");
    return previousVote;
  }

  const votingApi = `${API_BASE}/variants/${variantId}/vote`;

  const method = nextVote === null ? "DELETE" : "PUT";
  const direction = nextVote === null ? undefined : nextVote;

  const response = await fetch(votingApi, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      direction,
      reason,
      note,
    }),
  });

  if (!response.ok) {
    console.error("Vote request failed:", response.status);
    return previousVote;
  }

  return nextVote;
};

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
