import React from "react";
import { AlertCircle, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: string;
  children: React.ReactNode;
}

export const Callout = ({ type = "info", children }: CalloutProps) => {
  // Map typical callout types to styling (Subtle premium style)
  const variants: Record<
    string,
    {
      container: string;
      iconColor: string;
      icon: React.ReactNode;
      title: string;
    }
  > = {
    info: {
      container: "bg-blue-500/10 border-blue-500",
      iconColor: "text-blue-700 dark:text-blue-400",
      icon: <Info className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Info",
    },
    note: {
      container: "bg-blue-500/10 border-blue-500",
      iconColor: "text-blue-700 dark:text-blue-400",
      icon: <Info className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Note",
    },
    caution: {
      container: "bg-amber-500/10 border-amber-500",
      iconColor: "text-amber-700 dark:text-amber-400",
      icon: <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Caution",
    },
    warning: {
      container: "bg-amber-500/10 border-amber-500",
      iconColor: "text-amber-700 dark:text-amber-400",
      icon: <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Warning",
    },
    tip: {
      container: "bg-green-500/10 border-green-500",
      iconColor: "text-green-700 dark:text-green-400",
      icon: <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Tip",
    },
    danger: {
      container: "bg-red-500/10 border-red-500",
      iconColor: "text-red-700 dark:text-red-400",
      icon: <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />,
      title: "Danger",
    },
  };

  const currentVariant = variants[type] ?? variants.info;

  return (
    <div
      className={cn(
        "my-6 flex items-start gap-4 rounded-l-none rounded-r-lg border-l-4 p-4 shadow-sm",
        currentVariant.container
      )}
    >
      <div className={currentVariant.iconColor}>{currentVariant.icon}</div>
      <div className="flex w-full flex-col gap-1">
        <span
          className={cn(
            "text-sm font-bold tracking-wider uppercase",
            currentVariant.iconColor
          )}
        >
          {currentVariant.title}
        </span>
        <div className="text-sm leading-relaxed text-foreground [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
};
