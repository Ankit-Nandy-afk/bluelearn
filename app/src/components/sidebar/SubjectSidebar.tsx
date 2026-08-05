import { Link } from "@tanstack/react-router";

import type { SubjectGroup } from "@bluelearn/schemas";

import { CollapsibleSection } from "@/components/CollapsibleSection";

import { Route as SubjectRoute } from "@/routes/subjects.$slug";

type SubjectsProps = {
  groups: Array<SubjectGroup>;
};

export const SubjectSidebar = ({ groups }: SubjectsProps) => {
  return (
    <aside className="hidden overflow-y-auto border-r px-6 md:block">
      {groups.map(({ char, subjects }) => (
        <CollapsibleSection key={char} title={char}>
          <ul className="space-y-2">
            {subjects.map((subject) => (
              <li
                key={subject.slug}
                className="pl-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Link to={SubjectRoute.to} params={{ slug: subject.slug }}>
                  {subject.name}
                </Link>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      ))}
    </aside>
  );
};
