import { GuideCard } from "@/components/cards/GuideCard";

import { Route as GuideRoute } from "@/routes/guides/$slug/index";

type Props = {
  Stepper: any;
  target: any;
  objective: any;
};

export function SubObjectiveStep({ Stepper, target, objective }: Props) {
  return (
    <Stepper.Content step={target.slug}>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        {/* ordered guides */}
        <ol className="m-0 flex w-full list-none flex-col gap-6 p-0">
          {target.guides.map((subobjective: any, index: number) => {
            const guide = {
              ...subobjective.guide,
              stats: [
                {
                  label: "Duration",
                  data: subobjective.guide.duration,
                },
              ],
            };

            return (
              <li key={guide.slug} className="flex items-start gap-6">
                <div className="flex w-9 shrink-0 flex-col items-center self-stretch">
                  <div className="mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-badge-border bg-badge font-mono text-sm font-semibold text-badge-foreground">
                    {index + 1}
                  </div>

                  {index < target.guides.length - 1 && (
                    <div className="mt-2 -mb-8 w-px flex-1 bg-border" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <GuideCard
                    guide={guide}
                    to={GuideRoute.to}
                    origin={{
                      type: "objective",
                      title: objective.title,
                      path: `/objectives/${objective.slug}`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Stepper.Content>
  );
}
