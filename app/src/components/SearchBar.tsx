import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  // Defaults to clearing the field; browse also clears the URL query.
  onClear?: () => void;
  placeholder?: string;
  // Optional control rendered between the input and the Search button, e.g.
  // /browse's collection filter. Omitted on pages that don't filter.
  filter?: React.ReactNode;
};

// The large search bar shared by the home page and /browse. The only thing
// that differs between them is what onSubmit does, so that's a prop.
export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search guides, objectives...",
  filter,
}: Props) {
  return (
    <form
      className="flex gap-2 sm:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="relative flex-1 rounded-md">
        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-4 sm:w-4" />

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 pr-9 pl-9 text-xs sm:h-14 sm:pr-12 sm:pl-11 sm:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={() => (onClear ? onClear() : onChange(""))}
            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:bg-muted sm:right-3"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>

      {filter}

      <Button
        type="submit"
        className="btn-pri h-9 px-4 text-xs sm:h-14 sm:px-8 sm:text-sm"
      >
        Search
      </Button>
    </form>
  );
}
