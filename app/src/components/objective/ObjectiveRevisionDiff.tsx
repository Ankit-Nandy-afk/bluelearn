import { Fragment } from "react";

import type {
  DiffLine,
  ObjectiveRevisionDiff as ObjectiveRevisionDiffData,
  ObjectiveTargetDiff,
} from "@bluelearn/schemas";
import { DiffField } from "@/components/RevisionDiff";
import { nodeLabel } from "@/lib/objectiveSnapshot";
import { cn } from "@/lib/utils";

type Status = ObjectiveTargetDiff["status"];

const TONE_STYLES: Record<Status, string> = {
  added: "diff-status-added",
  removed: "diff-status-removed",
  changed: "diff-status-changed",
  unchanged: "diff-status-unchanged",
};

const STATUS_LABELS: Record<Status, string> = {
  added: "New sub-objective",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Unchanged",
};

type StepRow = {
  left: DiffLine | null;
  right: DiffLine | null;
  leftNumber: number | null;
  rightNumber: number | null;
};

function toStepRows(lines: Array<DiffLine>): Array<StepRow> {
  const rows: Array<StepRow> = [];
  let removed: Array<DiffLine> = [];
  let added: Array<DiffLine> = [];
  let leftNumber = 0;
  let rightNumber = 0;

  const flush = () => {
    const height = Math.max(removed.length, added.length);
    for (let i = 0; i < height; i++) {
      const left = i < removed.length ? removed[i] : null;
      const right = i < added.length ? added[i] : null;
      rows.push({
        left,
        right,
        leftNumber: left === null ? null : ++leftNumber,
        rightNumber: right === null ? null : ++rightNumber,
      });
    }
    removed = [];
    added = [];
  };

  for (const line of lines) {
    if (line.type === "removed") removed.push(line);
    else if (line.type === "added") added.push(line);
    else {
      flush();
      rows.push({
        left: line,
        right: line,
        leftNumber: ++leftNumber,
        rightNumber: ++rightNumber,
      });
    }
  }
  flush();

  return rows;
}

const BADGE_STYLES: Record<DiffLine["type"], string> = {
  added: "diff-num-added",
  removed: "diff-num-removed",
  unchanged: "diff-num-unchanged",
};

// One side of a step row. A null step is padding opposite a longer run.
function StepCell({
  line,
  number,
}: {
  line: DiffLine | null;
  number: number | null;
}) {
  if (!line) return <div className="bg-muted/40" />;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2",
        line.type === "removed" && "diff-removed",
        line.type === "added" && "diff-added"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold tabular-nums",
          BADGE_STYLES[line.type]
        )}
      >
        {number}
      </div>

      <p className="flex min-h-6 min-w-0 flex-1 items-center text-sm font-bold break-words">
        {line.text}
      </p>
    </div>
  );
}

function TargetSection({ target }: { target: ObjectiveTargetDiff }) {
  const rows = toStepRows(target.lines);

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-3 py-2">
        <p className="min-w-0 font-mono text-[11px] font-bold tracking-[0.08em] break-words uppercase">
          {nodeLabel(target)}
        </p>
        <span
          className={cn(
            "mono-micro flex shrink-0 items-center rounded-md border px-2 py-0.5",
            TONE_STYLES[target.status]
          )}
        >
          {STATUS_LABELS[target.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x">
        {rows.map((row, i) => (
          <Fragment key={i}>
            <StepCell line={row.left} number={row.leftNumber} />
            <StepCell line={row.right} number={row.rightNumber} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function ObjectiveRevisionDiff({
  diff,
  fromLabel = "Previous version",
  toLabel = "This revision",
}: {
  diff: ObjectiveRevisionDiffData;
  fromLabel?: string;
  toLabel?: string;
}) {
  const { targets, fields } = diff;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-2 divide-x border-b bg-muted/60">
          <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            {fromLabel}
          </p>
          <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            {toLabel}
          </p>
        </div>

        <DiffField label="Title" field={fields.title} />
        <DiffField label="Summary" field={fields.summary} />
      </div>

      {targets.map((target) => (
        <TargetSection key={target.guide_base_id} target={target} />
      ))}
    </div>
  );
}
