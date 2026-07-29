import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";

import { SubjectsGrid } from "@/components/subjects/SubjectGrid";
import {
  NoSubjectsError,
  SubjectsLoadError,
} from "@/components/subjects/SubjectsError";
import { SubjectSidebar } from "@/components/sidebar/SubjectSidebar";

import { listSubjects } from "@/lib/api/subjects";
import { getSubjectNamesGroupedByFirstLetter } from "@/lib/groupSubjects";

export const Route = createFileRoute("/subjects/")({
  loader: ({ abortController }) =>
    listSubjects({ signal: abortController.signal }),
  errorComponent: SubjectsLoadError,
  component: RouteComponent,
});

type SubjectsPageProps = {
  children: React.ReactNode;
};

export const SubjectsPage = ({ children }: SubjectsPageProps) => {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
      <div className="border-b px-8 py-8 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Browse By Subjects
          </h1>
        </div>

        <Separator className="mb-4 bg-border" />

        {children}
      </div>
    </div>
  );
};

function RouteComponent() {
  const subjects = Route.useLoaderData();

  const subjectsGroupedByNameFirstCharacter = useMemo(
    () => getSubjectNamesGroupedByFirstLetter(subjects),
    [subjects]
  );

  if (subjects.length === 0) {
    return (
      <SubjectsPage>
        <NoSubjectsError />
      </SubjectsPage>
    );
  }

  return (
    <SubjectsPage>
      <section className="grid md:grid-cols-[320px_1fr]">
        <SubjectSidebar groupedSubject={subjectsGroupedByNameFirstCharacter} />

        <SubjectsGrid subjects={subjects} />
      </section>
    </SubjectsPage>
  );
}
