import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import type { DownvoteReason } from "@/lib/api/votes";
import { downvoteReasonItems } from "@/lib/api/votes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  existing: { reason: DownvoteReason | null; note: string | null } | null;
  onSubmit: (reason: DownvoteReason, note: string) => void;
  onRemove: () => void;
};

export const DownvoteModal = ({
  open,
  onOpenChange,
  submitting,
  existing,
  onSubmit,
  onRemove,
}: PropsTypes) => {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason(existing?.reason ?? "");
    setNote(existing?.note ?? "");
  }, [open, existing]);

  const handleSubmit = () => {
    if (!reason || submitting) return;
    onSubmit(reason as DownvoteReason, note.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="gap-2 p-5 pb-0">
          <span className="mono-micro text-muted-foreground">Downvote</span>
          <DialogTitle className="editorial-heading text-lg">
            {existing ? "Update your downvote" : "Why this downvote?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            A downvote needs a reason so the author knows what to fix. Only the
            reason is required; the note is yours to add if it helps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <FieldLabel className="text-xs">Reason</FieldLabel>
            <Combobox
              items={downvoteReasonItems}
              value={reason}
              onValueChange={setReason}
              disabled={submitting}
              modal
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="downvote-note" className="text-xs">
              Note (optional)
            </FieldLabel>
            <Textarea
              id="downvote-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Add anything the author should know."
            />
          </div>
        </div>

        <DialogFooter className="p-5 pt-0">
          {existing && (
            <Button
              variant="destructive"
              size="lg"
              className="mr-auto"
              disabled={submitting}
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove vote
            </Button>
          )}

          <DialogClose asChild>
            <Button variant="outline" size="lg" className="btn-sec">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            className="btn-pri"
            disabled={submitting || !reason}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
