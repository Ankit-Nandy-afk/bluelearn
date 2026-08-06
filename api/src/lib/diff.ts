// Shared diff helpers used by both the guide-revision and objective-revision
// diff endpoints, over text fields and over ordered sequences alike (a
// sub-objective's curated guide order diffs the same way a body's lines do).
//
// The diff format is unified-diff-style: lines starting with " " are
// unchanged, "-" only in `from`, "+" only in `to`. Matches `git diff
// --unified=0` for the simple cases that matter to us (no hunk headers, no
// context lines).
//
// In addition to the legacy unified-diff string, `diffField` also returns a
// structured `lines` array of `{ type, text }` tokens. Split-view renderers
// should consume `lines` directly rather than re-splitting the string on
// "\n" and stripping the prefix -- the tokens are the primary output, the
// string is derived from them for backward compatibility with clients that
// already parse unified-diff.

// One row of a rendered field diff. `type` tells a split-view renderer which
// column the line belongs in (left only, right only, or both); `text` is the
// line content without the unified-diff prefix character.
export type DiffLine = {
  type: "unchanged" | "added" | "removed";
  text: string;
};

// One field's rendered diff. `changed: false` + `diff: null` + `lines: null`
// means the field is byte-identical between the two revisions (including
// both null); the frontend can collapse it. When changed, both `diff` (the
// unified-diff string) and `lines` (the structured tokens) are populated
// from a single LCS walk. Matches the OpenAPI `FieldDiff` schema.
export type FieldDiff = {
  changed: boolean;
  diff: string | null;
  lines: DiffLine[] | null;
};

// Compare two nullable string fields. null === null (and any identical pair)
// is unchanged. Otherwise builds both the unified-diff string and the
// structured token list via `createFieldDiffLines`, so the LCS walk runs once.
export function diffField(from: string | null, to: string | null): FieldDiff {
  if (from === to) return { changed: false, diff: null, lines: null };
  const lines = createFieldDiffLines(from, to);
  return {
    changed: true,
    lines,
    diff: lines
      .map((l) =>
        l.type === "unchanged"
          ? ` ${l.text}`
          : l.type === "added"
            ? `+${l.text}`
            : `-${l.text}`
      )
      .join("\n"),
  };
}

// Minimal LCS-based diff over any two ordered sequences, producing a
// structured token list.
export function diffSequences<T>(
  from: T[],
  to: T[],
  key: (item: T) => string,
  label: (item: T) => string
): DiffLine[] {
  const m = from.length;
  const n = to.length;
  const fromKeys = from.map(key);
  const toKeys = to.map(key);
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (fromKeys[i] === toKeys[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Reconstruct the diff by walking forward, emitting "unchanged" / "removed"
  // / "added" tokens in the order a reader expects (matches `git diff
  // --unified=0`).
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (fromKeys[i] === toKeys[j]) {
      out.push({ type: "unchanged", text: label(to[j]) });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "removed", text: label(from[i]) });
      i++;
    } else {
      out.push({ type: "added", text: label(to[j]) });
      j++;
    }
  }
  while (i < m) {
    out.push({ type: "removed", text: label(from[i]) });
    i++;
  }
  while (j < n) {
    out.push({ type: "added", text: label(to[j]) });
    j++;
  }

  return out;
}

function createFieldDiffLines(
  from: string | null,
  to: string | null
): DiffLine[] {
  const identity = (line: string) => line;
  return diffSequences(
    (from ?? "").split("\n"),
    (to ?? "").split("\n"),
    identity,
    identity
  );
}
