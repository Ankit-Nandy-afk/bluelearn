import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import type {
  ActivityFilters,
  ActivitySort,
  ActivityStatusFilter,
  ActivityTypeFilter,
} from "@/lib/profile";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SetFilters = (next: Partial<ActivityFilters>) => void;

function formatMDY(date: Date | undefined) {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

function parseMDY(text: string) {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, m, d, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // reject overflow like 13/40 that Date would silently roll over
  if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d))
    return undefined;
  return date;
}

// yyyy-mm-dd in local time, which is what the URL stores
function toISODate(date: Date | undefined) {
  if (!date) return undefined;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseISODate(value: string | undefined) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function ColumnFilter({
  label,
  active,
  onClear,
  className,
  children,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex cursor-pointer items-center gap-1.5 uppercase transition-colors",
              active ? "text-brand-blue" : "hover:text-foreground/70"
            )}
          >
            <span>{label}</span>
            <SlidersHorizontalIcon className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("w-56 gap-3 tracking-normal normal-case", className)}
        >
          {children}
        </PopoverContent>
      </Popover>
      {active && (
        <button
          type="button"
          aria-label={`Clear ${label} filter`}
          onClick={onClear}
          className="flex size-4 cursor-pointer items-center justify-center rounded text-brand-blue hover:bg-brand-blue/10"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function SortRow({
  active,
  ascending,
  onClick,
}: {
  active: boolean;
  ascending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
        active ? "bg-accent text-foreground" : "hover:bg-muted"
      )}
    >
      {ascending ? (
        <ArrowUpIcon className="size-3.5" />
      ) : (
        <ArrowDownIcon className="size-3.5" />
      )}
      <span>Sort {ascending ? "Ascending" : "Descending"}</span>
    </button>
  );
}

export function TextColumnFilter({
  label,
  field,
  search,
  setFilters,
}: {
  label: string;
  field: "title" | "summary";
  search: ActivityFilters;
  setFilters: SetFilters;
}) {
  const asc = `${field}_asc` as ActivitySort;
  const desc = `${field}_desc` as ActivitySort;
  const colSort =
    search.sort === asc ? "asc" : search.sort === desc ? "desc" : null;
  const active = Boolean(search[field]) || colSort !== null;

  return (
    <ColumnFilter
      label={label}
      active={active}
      onClear={() =>
        setFilters({
          [field]: undefined,
          sort: colSort ? undefined : search.sort,
        })
      }
    >
      <Input
        value={search[field] ?? ""}
        onChange={(e) => setFilters({ [field]: e.target.value || undefined })}
        placeholder={`Search ${label.toLowerCase()}...`}
        className="h-7"
      />
      <div className="flex flex-col">
        <SortRow
          ascending
          active={colSort === "asc"}
          onClick={() =>
            setFilters({ sort: colSort === "asc" ? undefined : asc })
          }
        />
        <SortRow
          ascending={false}
          active={colSort === "desc"}
          onClick={() =>
            setFilters({ sort: colSort === "desc" ? undefined : desc })
          }
        />
      </div>
    </ColumnFilter>
  );
}

export function ChoiceColumnFilter({
  label,
  field,
  options,
  search,
  setFilters,
}: {
  label: string;
  field: "type" | "status";
  options: ReadonlyArray<{
    value: ActivityTypeFilter | ActivityStatusFilter;
    label: string;
  }>;
  search: ActivityFilters;
  setFilters: SetFilters;
}) {
  const selected = new Set<string>(search[field] ?? []);

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setFilters({ [field]: next.size ? [...next] : undefined });
  }

  return (
    <ColumnFilter
      label={label}
      active={selected.size > 0}
      onClear={() => setFilters({ [field]: undefined })}
    >
      <div className="flex flex-col gap-0.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-muted"
          >
            <Checkbox
              checked={selected.has(option.value)}
              onCheckedChange={() => toggle(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </ColumnFilter>
  );
}

export function DateColumnFilter({
  search,
  setFilters,
}: {
  search: ActivityFilters;
  setFilters: SetFilters;
}) {
  const from = parseISODate(search.from);
  const to = parseISODate(search.to);
  const colSort =
    search.sort === "date_asc"
      ? "asc"
      : search.sort === undefined
        ? "desc"
        : null;
  const active =
    Boolean(search.from || search.to) || search.sort === "date_asc";

  // which field the calendar is editing; null hides the calendar
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [fieldText, setFieldText] = useState("");

  function openField(field: "from" | "to") {
    setActiveField(field);
    setFieldText(formatMDY(field === "from" ? from : to));
  }

  // commit both endpoints, swapping if they ended up reversed
  function commit(nextFrom: Date | undefined, nextTo: Date | undefined) {
    let start = nextFrom;
    let end = nextTo;
    if (start && end && start > end) [start, end] = [end, start];
    setFilters({ from: toISODate(start), to: toISODate(end) });
  }

  function onPickDay(date: Date | undefined) {
    setFieldText(formatMDY(date));
    if (activeField === "to") commit(from, date);
    else commit(date, to);
  }

  function onFieldText(value: string) {
    setFieldText(value);
    const date = value.trim() ? parseMDY(value) : undefined;
    if (!value.trim() || date) {
      if (activeField === "to") commit(from, date);
      else commit(date, to);
    }
  }

  const activeDate = activeField === "to" ? to : from;

  return (
    <ColumnFilter
      label="Date"
      active={active}
      onClear={() =>
        setFilters({
          from: undefined,
          to: undefined,
          sort: search.sort === "date_asc" ? undefined : search.sort,
        })
      }
      className="w-auto"
    >
      <div className="text-xs font-medium">Filter by date</div>
      <div className="flex items-center gap-2">
        <DateField
          active={activeField === "from"}
          date={from}
          onClick={() => openField("from")}
        />
        <span className="text-muted-foreground">and</span>
        <DateField
          active={activeField === "to"}
          date={to}
          onClick={() => openField("to")}
        />
      </div>

      {activeField && (
        <div className="flex flex-col gap-2">
          <Input
            autoFocus
            value={fieldText}
            onChange={(e) => onFieldText(e.target.value)}
            placeholder="MM/DD/YYYY"
            className="h-7"
          />
          <Calendar
            mode="single"
            selected={activeDate}
            onSelect={onPickDay}
            defaultMonth={activeDate}
          />
        </div>
      )}

      <div className="flex flex-col">
        <SortRow
          ascending
          active={colSort === "asc"}
          onClick={() =>
            setFilters({ sort: colSort === "asc" ? undefined : "date_asc" })
          }
        />
        <SortRow
          ascending={false}
          active={colSort === "desc"}
          onClick={() => setFilters({ sort: undefined })}
        />
      </div>
    </ColumnFilter>
  );
}

function DateField({
  active,
  date,
  onClick,
}: {
  active: boolean;
  date: Date | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors",
        active ? "border-brand-blue" : "border-input hover:bg-muted",
        !date && "text-muted-foreground"
      )}
    >
      {date ? formatMDY(date) : "Select date"}
    </button>
  );
}
