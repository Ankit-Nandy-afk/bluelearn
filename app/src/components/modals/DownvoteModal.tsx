import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { VotingType } from "@/lib/api/votes";
import { getVariantId } from "@/lib/api/guides";
import { Route } from "@/routes/guides/$slug/index";
import { downvoteReasons, submitVote } from "@/lib/api/votes";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// TODO: refactor

type PropTypes = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vote: VotingType;
  setVote: (vote: VotingType) => void;
  defaults: {
    vote: string | null;
    reason: string;
    note: string;
  };
};

export const DownvoteModal = ({
  isOpen,
  setIsOpen,
  vote,
  setVote,
  defaults,
}: PropTypes) => {
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [modified, setModified] = useState<boolean>(false);

  const [submitted, setSubmitted] = useState<boolean>();

  useEffect(() => {
    if (isOpen && !modified) {
      setReason(defaults.reason);
      setNote(defaults.note);
    }

    setSubmitted(defaults.vote === "down");
  }, [isOpen]);

  console.log("defaults:", defaults);
  console.log("defaults.vote === 'down':", defaults.vote === "down");
  console.log("submitted:", submitted);

  const handleNoteChange = (note: string) => {
    setModified(true);
    setNote(note);
  };
  const handleReasonChange = (reason: string) => {
    setModified(true);
    setReason(reason);
  };

  const { slug } = Route.useParams();

  const handleCancel = async () => {
    const variantId = await getVariantId(slug);

    if (vote !== null) {
      const newVote = await submitVote(variantId, null);
      setVote(newVote);
    }

    setIsOpen(false);
    handleNoteChange("");
    handleReasonChange("");
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    const variantId = await getVariantId(slug);
    const newVote = await submitVote(variantId, "down", reason, note);

    if (reason === "") {
      console.error("Downvote submission must contain reason");
      return;
    }

    if (newVote !== "down") {
      // TODO: handle case where downvote fails to submit
      console.log("Failed to submit downvote");
      setSubmitted(false);
    }

    setIsOpen(false);
    setSubmitted(true);
  };

  const handleOpenChange = async (willOpen: boolean) => {
    // Handle case where user closes out of dialog without clicking cancel
    const beingDismissed = !willOpen && isOpen;
    const beingOpened = willOpen && !isOpen;

    if (beingDismissed) {
      if (vote === "down") {
        setIsOpen(false);
        setVote("down");
      } else await handleCancel();

      return;
    }

    if (beingOpened && vote === "down") {
      setIsOpen(true);
      setVote("down");
      return;
    }

    console.error("DownvoteModal is neither being opened nor bein closed");
  };

  const config = {
    title: !submitted ? "Add Downvote" : "Modify Downvote",
    removeVoteTitle: !submitted ? "Cancel" : "Delete",
    removeVoteIcon: !submitted ? <X /> : <Trash2 />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>{config.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Dialog to submit reasoning for downvote
        </DialogDescription>

        <DialogHeader>Reason</DialogHeader>
        <Combobox
          items={downvoteReasons}
          value={reason}
          onValueChange={(reason) => handleReasonChange(reason)}
        />

        <DialogHeader>Note</DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="State your reason here."
        />

        <DialogFooter>
          <Button variant="destructive" size="lg" onClick={handleCancel}>
            {config.removeVoteIcon} {config.removeVoteTitle}
          </Button>
          <Button variant="default" size="lg" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
