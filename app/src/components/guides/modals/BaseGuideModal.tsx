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
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="gap-2 p-5 pb-0">
          <DialogTitle className="editorial-heading text-lg">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2.5 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-5 w-5 animate-spin text-primary" />
              <p className="mono-micro text-muted-foreground">{loadingText}</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : isEmpty ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
              {emptyIcon && (
                <div className="mx-auto mb-2 flex h-6 w-6 items-center justify-center text-muted-foreground/60">
                  {emptyIcon}
                </div>
              )}
              <p className="text-xs font-medium text-foreground">
                {emptyTitle}
              </p>
              {emptyDescription && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {emptyDescription}
                </p>
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
