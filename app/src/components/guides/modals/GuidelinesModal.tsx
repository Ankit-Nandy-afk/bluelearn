import ReactMarkdown from "react-markdown";
import { BaseGuideModal } from "@/components/guides/modals/BaseGuideModal";
import guidelines from "@/data/guidelines.md?raw";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const GuidelinesModal = ({ open, onOpenChange }: PropsTypes) => {
  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="All Guides Must..."
      description="Guidelines for guides."
    >
      <ReactMarkdown>{guidelines}</ReactMarkdown>
    </BaseGuideModal>
  );
};
