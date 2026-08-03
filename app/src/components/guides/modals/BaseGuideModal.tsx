import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type BaseGuideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  children?: ReactNode;
};

export function BaseGuideModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  loading = false,
  loadingText = "Loading...",
  error = null,
  isEmpty = false,
  emptyIcon,
  emptyTitle = "No items found",
  emptyDescription,
  emptyAction,
  children,
}: BaseGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-1/2 p-8 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {icon}
            <DialogTitle className="font-mono text-xs tracking-wider uppercase">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">{loadingText}</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : isEmpty ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              {emptyIcon && (
                <div className="mx-auto mb-2 flex h-6 w-6 items-center justify-center text-muted-foreground/60">
                  {emptyIcon}
                </div>
              )}
              <p className="text-xs font-medium text-foreground">
                {emptyTitle}
              </p>
              {emptyDescription && (
                <p className="mt-1 text-xs">{emptyDescription}</p>
              )}
              {emptyAction && <div className="mt-4">{emptyAction}</div>}
            </div>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
