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

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean | undefined;
  publishLabel?: string;
  onPublish: (() => void) | undefined;
};

export const ObjectivePublishModal = ({
  open,
  onOpenChange,
  submitting,
  publishLabel = "Publish",
  onPublish,
}: PropsTypes) => {
  const handlePublish = () => {
    if (onPublish) onPublish();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="gap-2 p-5 pb-0">
          <span className="mono-micro text-muted-foreground">
            {publishLabel}
          </span>
          <DialogTitle className="editorial-heading text-lg">
            Are you sure you want to publish this objective?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            The objective goes live right away with the guides and sequence you
            picked. Learners can start it immediately. You can edit it later,
            but anyone already in progress will see the change.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-5">
          <DialogClose asChild>
            <Button variant="outline" size="lg" className="btn-sec">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="lg"
            className="btn-pri"
            disabled={submitting}
            onClick={handlePublish}
          >
            {submitting ? "Publishing..." : publishLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
