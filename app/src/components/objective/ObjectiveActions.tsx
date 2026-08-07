import { useCallback, useState } from "react";
import { History, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContributorsModal } from "@/components/guides/modals/ContributorsModal";
import { RevisionsModal } from "@/components/guides/modals/RevisionsModal";
import {
  getObjectiveContributors,
  listObjectiveRevisions,
} from "@/lib/api/objectives";

type ModalType = "contributors" | "revisions";

const ACTIONS: Array<{
  icon: typeof Users;
  label: string;
  type: ModalType;
}> = [
  { icon: Users, label: "View Contributors", type: "contributors" },
  { icon: History, label: "View Revisions", type: "revisions" },
];

type ObjectiveActionsProps = {
  slug: string;
};

export function ObjectiveActions({ slug }: ObjectiveActionsProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const close = (open: boolean) => !open && setActiveModal(null);

  const fetchContributors = useCallback(
    () => getObjectiveContributors(slug),
    [slug]
  );

  const fetchRevisions = useCallback(async () => {
    const { revisions } = await listObjectiveRevisions(slug, { limit: 100 });
    return revisions.map((rev) => ({
      id: rev.id,
      change_summary: rev.change_summary,
      author: rev.author,
      date: rev.published_at ?? rev.created_at,
    }));
  }, [slug]);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        {ACTIONS.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveModal(action.type)}
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <ContributorsModal
        open={activeModal === "contributors"}
        onOpenChange={close}
        fetchContributors={fetchContributors}
        title="Objective Contributors"
        description="Curators who created revisions for this objective."
        emptyDescription="No curators have been credited for this objective yet."
      />

      <RevisionsModal
        open={activeModal === "revisions"}
        onOpenChange={close}
        fetchRevisions={fetchRevisions}
        title="Revision History"
        description="Chronological log of changes and published revisions for this objective."
        emptyDescription="This objective does not have any recorded revision history yet."
        linkTo={(rev) => ({
          to: "/objectives/$slug/revisions/$revisionId",
          params: { slug, revisionId: rev.id },
        })}
      />
    </>
  );
}
