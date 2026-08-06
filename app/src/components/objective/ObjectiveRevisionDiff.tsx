import { Fragment } from "react";
import { Minus, PenLine, Plus } from "lucide-react";

import type {
  DiffLine,
  ObjectiveRevisionDiff as ObjectiveRevisionDiffData,
  ObjectiveSnapshotNode,
  ObjectiveTargetDiff,
} from "@bluelearn/schemas";
import { DiffField } from "@/components/RevisionDiff";
import { nodeLabel } from "@/lib/objectiveSnapshot";
import { cn } from "@/lib/utils";

type Status = "added" | "removed" | "changed";

// A step that survived the revision reads as context, so it gets a row with no
// icon and no fill — only enough structure to line up with the rows beside it.
type Tone = Status | "unchanged";

const TONE_STYLES: Record<Tone, string> = {
  added:
    "border-green-600/40 bg-green-600/10 text-green-900 dark:text-green-200",
  removed: "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-200",
  changed:
    "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  unchanged: "border-transparent text-muted-foreground",
};

const TONE_ICONS: Record<Tone, typeof Plus | null> = {
  added: Plus,
  removed: Minus,
  changed: PenLine,
  unchanged: null,
};

const STATUS_LABELS: Record<Status, string> = {
  added: "New sub-objective",
  removed: "Removed",
  changed: "Changed",
};

function changedFields(from: ObjectiveSnapshotNode, to: ObjectiveSnapshotNode) {
  const changes: Array<string> = [];
  if (from.guide_id !== to.guide_id) changes.push("variant");
  if (from.is_target !== to.is_target)
    changes.push(to.is_target ? "made a sub-objective" : "no longer a target");
  if (from.is_included !== to.is_included)
    changes.push(to.is_included ? "included" : "skipped");
  if (from.is_featured !== to.is_featured)
    changes.push(to.is_featured ? "featured" : "unfeatured");
  if (from.target_position !== to.target_position)
    changes.push(`position ${from.target_position} to ${to.target_position}`);
  if (from.note !== to.note) changes.push("note");
  return changes;
}

function Row({
  tone,
  label,
  detail,
}: {
  tone: Tone;
  label: string;
  detail?: string;
}) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2",
        TONE_STYLES[tone]
      )}
    >
      {Icon ? (
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-xs font-bold break-words">{label}</p>
        {detail && <p className="mono-micro opacity-80">{detail}</p>}
      </div>
    </div>
  );
}

type StepRow = { left: DiffLine | null; right: DiffLine | null };

// The API hands back one flat stream of the sub-objective's steps. A run of
// removed steps sits across from the run of additions that replaced it,
// shorter side padded; a step that survived spans both columns.
function toStepRows(lines: Array<DiffLine>): Array<StepRow> {
  const rows: Array<StepRow> = [];
  let removed: Array<DiffLine> = [];
  let added: Array<DiffLine> = [];

  const flush = () => {
    const height = Math.max(removed.length, added.length);
    for (let i = 0; i < height; i++)
      rows.push({ left: removed[i] ?? null, right: added[i] ?? null });
    removed = [];
    added = [];
  };

  for (const line of lines) {
    if (line.type === "removed") removed.push(line);
    else if (line.type === "added") added.push(line);
    else {
      flush();
      rows.push({ left: line, right: line });
    }
  }
  flush();

  return rows;
}

// One side of a step row. A null step is padding opposite a longer run.
function StepCell({ line }: { line: DiffLine | null }) {
  if (!line) return <div className="bg-muted/40" />;

  return (
    <div className="px-2 py-1">
      <Row tone={line.type} label={line.text} />
    </div>
  );
}

function TargetSection({
  target,
  fromLabel,
  toLabel,
}: {
  target: ObjectiveTargetDiff & { status: Status };
  fromLabel: string;
  toLabel: string;
}) {
  const StatusIcon = TONE_ICONS[target.status];

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-3 py-2">
        <p className="min-w-0 font-mono text-[11px] font-bold tracking-[0.08em] break-words uppercase">
          {nodeLabel(target)}
        </p>
        <span
          className={cn(
            "mono-micro flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5",
            TONE_STYLES[target.status]
          )}
        >
          {StatusIcon && <StatusIcon className="h-3 w-3" />}
          {STATUS_LABELS[target.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x border-b bg-muted/40">
        <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {fromLabel}
        </p>
        <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {toLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x">
        {toStepRows(target.lines).map((row, i) => (
          <Fragment key={i}>
            <StepCell line={row.left} />
            <StepCell line={row.right} />
          </Fragment>
        ))}
      </div>

      {target.changed.length > 0 && (
        <div className="space-y-2 border-t p-3">
          {target.changed.map(({ from, to }) => (
            <Row
              key={to.guide_base_id}
              tone="changed"
              label={nodeLabel(to)}
              detail={changedFields(from, to).join(" · ") || undefined}
            />
          ))}
        </div>
      )}
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

  const fieldsChanged = fields.title.changed || fields.summary.changed;
  const changedTargets = targets.filter(
    (t): t is ObjectiveTargetDiff & { status: Status } =>
      t.status !== "unchanged"
  );

  if (!fieldsChanged && changedTargets.length === 0) {
    return (
      <p className="mono-micro text-muted-foreground">
        This revision proposes no changes to the objective.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {fieldsChanged && (
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
      )}

      {changedTargets.map((target) => (
        <TargetSection
          key={target.guide_base_id}
          target={target}
          fromLabel={fromLabel}
          toLabel={toLabel}
        />
      ))}
    </div>
  );
}
