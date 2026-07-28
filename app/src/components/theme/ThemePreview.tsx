import { cn } from "@/lib/utils";

type ThemePrevProp = {
  theme: "light" | "dark";
};

export const ThemePreview = ({ theme }: ThemePrevProp) => {
  const dark = theme === "dark";

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Browser Bar */}
      <div
        className={cn(
          "flex h-8 items-center gap-1 px-3",
          dark ? "bg-zinc-900" : "bg-zinc-100"
        )}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
      </div>

      <div className={cn("flex h-36", dark ? "bg-zinc-950" : "bg-white")}>
        {/* Sidebar */}
        <div
          className={cn(
            "w-24 border-r p-2",
            dark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-50"
          )}
        >
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded",
                  dark ? "bg-zinc-700" : "bg-zinc-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-3">
          <div
            className={cn(
              "mb-3 h-3 w-24 rounded",
              dark ? "bg-zinc-700" : "bg-zinc-300"
            )}
          />

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-10 rounded-lg border",
                  dark
                    ? "border-zinc-800 bg-zinc-900"
                    : "border-zinc-200 bg-zinc-50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
