import { ChevronsUpDown } from "lucide-react";
import { Fragment, useState } from "react";

import type { DiffLine, FieldDiff, RevisionRef } from "@bluelearn/schemas";
import { cn } from "@/lib/utils";

export type { DiffLine, FieldDiff };

export type RevisionDiffData = {
  from: RevisionRef;
  to: RevisionRef;
  fields: {
    title: FieldDiff;
    summary: FieldDiff;
    body: FieldDiff;
  };
};

type Row = {
  left: string | null;
  right: string | null;
  leftLineNumber: number | null;
  rightLineNumber: number | null;
};

// The API hands back one flat stream of +/-/context tokens. A run of removals
// sits across from the run of additions that replaced it, shorter side padded.
// Each side counts its own lines so the numbers match the real text, padding
// rows staying blank.
function toRows(lines: Array<DiffLine>): Array<Row> {
  const rows: Array<Row> = [];
  let removed: Array<string> = [];
  let added: Array<string> = [];
  let leftLineNumber = 0;
  let rightLineNumber = 0;

  const flush = () => {
    const height = Math.max(removed.length, added.length);
    for (let i = 0; i < height; i++) {
      const left = i < removed.length ? removed[i] : null;
      const right = i < added.length ? added[i] : null;
      rows.push({
        left,
        right,
        leftLineNumber: left === null ? null : ++leftLineNumber,
        rightLineNumber: right === null ? null : ++rightLineNumber,
      });
    }
    removed = [];
    added = [];
  };

  for (const line of lines) {
    if (line.type === "removed") removed.push(line.text);
    else if (line.type === "added") added.push(line.text);
    else {
      flush();
      rows.push({
        left: line.text,
        right: line.text,
        leftLineNumber: ++leftLineNumber,
        rightLineNumber: ++rightLineNumber,
      });
    }
  }
  flush();

  return rows;
}

// Untouched lines kept on each side of a change, so it reads in context.
const CONTEXT = 3;

// The mininum number of hidden lines that justifies collapsing them into a
// "Show N changed lines" button.
const MIN_GAP = 3;

type Chunk = { kind: "rows" | "gap"; rows: Array<Row> };

// Splits the rows into what's worth showing and the stretches of untouched text
// between them, so a long body doesn't bury its few edits.
function toChunks(rows: Array<Row>): Array<Chunk> {
  const keep = new Array<boolean>(rows.length).fill(false);

  rows.forEach((row, i) => {
    if (row.left === row.right) return;
    const from = Math.max(0, i - CONTEXT);
    const to = Math.min(rows.length - 1, i + CONTEXT);
    for (let j = from; j <= to; j++) keep[j] = true;
  });

  const chunks: Array<Chunk> = [];
  for (let i = 0; i < rows.length; ) {
    let j = i;
    while (j < rows.length && keep[j] === keep[i]) j++;

    const slice = rows.slice(i, j);
    const collapsible = !keep[i] && slice.length >= MIN_GAP;
    chunks.push({ kind: collapsible ? "gap" : "rows", rows: slice });
    i = j;
  }

  return chunks;
}

// Each side ot a diff row (live and proposed cell).
const LineCell = ({
  text,
  line,
  tone,
}: {
  text: string | null;
  line: number | null;
  tone: "removed" | "added" | null;
}) => {
  const shade = text === null ? null : tone;

  return (
    <div
      className={cn(
        "flex gap-3 font-mono text-xs leading-relaxed",
        shade === "removed" &&
          "bg-red-500/10 text-red-900 dark:bg-red-500/15 dark:text-red-200",
        shade === "added" &&
          "bg-green-600/10 text-green-900 dark:bg-green-600/15 dark:text-green-200",
        text === null && "bg-muted/40"
      )}
    >
      <span
        className={cn(
          "w-10 shrink-0 py-0.5 text-center tabular-nums opacity-70 select-none",
          shade === "removed" && "bg-red-500/20 dark:bg-red-500/25",
          shade === "added" && "bg-green-600/20 dark:bg-green-600/25",
          !shade && "opacity-50"
        )}
      >
        {line}
      </span>
      <span className="min-w-0 flex-1 py-0.5 pr-3 break-words whitespace-pre-wrap">
        {text ? text : " "}
      </span>
    </div>
  );
};

export const DiffField = ({
  label,
  field,
}: {
  label: string;
  field: FieldDiff;
}) => {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  if (!field.changed || !field.lines) {
    return (
      <div className="flex items-baseline gap-3 border-b px-3 py-2 last:border-b-0">
        <p className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {label}
        </p>
        <p className="mono-micro text-muted-foreground">Unchanged</p>
      </div>
    );
  }

  const chunks = toChunks(toRows(field.lines));

  return (
    <div className="border-b last:border-b-0">
      <p className="border-b bg-muted/40 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
        {label}
      </p>

      <div className="grid grid-cols-2 divide-x">
        {chunks.map((chunk, c) =>
          chunk.kind === "gap" && !expanded.has(c) ? (
            <button
              key={c}
              type="button"
              onClick={() => setExpanded((prev) => new Set(prev).add(c))}
              className="col-span-2 flex w-full items-center gap-2 border-y border-l-0 bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground hover:bg-muted"
            >
              <ChevronsUpDown className="size-3" />
              Show {chunk.rows.length} unchanged lines
            </button>
          ) : (
            chunk.rows.map((row, i) => {
              const changed = row.left !== row.right;
              return (
                <Fragment key={`${c}-${i}`}>
                  <LineCell
                    text={row.left}
                    line={row.leftLineNumber}
                    tone={changed ? "removed" : null}
                  />
                  <LineCell
                    text={row.right}
                    line={row.rightLineNumber}
                    tone={changed ? "added" : null}
                  />
                </Fragment>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export const RevisionDiff = ({
  diff,
  fromLabel = "Live version",
  toLabel = "Proposed",
}: {
  diff: RevisionDiffData;
  fromLabel?: string;
  toLabel?: string;
}) => {
  const unchanged =
    !diff.fields.title.changed &&
    !diff.fields.summary.changed &&
    !diff.fields.body.changed;

  if (unchanged) {
    return (
      <p className="mono-micro text-muted-foreground">
        This revision proposes no changes to the title, summary, or body.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="grid grid-cols-2 divide-x border-b bg-muted/60">
        <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {fromLabel}
        </p>
        <p className="px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {toLabel}
        </p>
      </div>

      <DiffField label="Title" field={diff.fields.title} />
      <DiffField label="Summary" field={diff.fields.summary} />
      <DiffField label="Body" field={diff.fields.body} />
    </div>
  );
};
