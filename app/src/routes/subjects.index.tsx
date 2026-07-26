import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import type {
  SubjectListItem,
  SubjectReference,
  SubjectReferences,
} from "@bluelearn/schemas";

import { Separator } from "@/components/ui/separator";

import { SubjectCard } from "@/components/cards/SubjectCard";
import { Route as SubjectRoute } from "@/routes/subjects.$slug";

import { listSubjects } from "@/lib/api/subjects";
import { CollapsibleSection } from "@/components/CollapsibleSection";

import { Combobox } from "@/components/ui/combobox";

type Subjects = Array<SubjectListItem>;

type SubjectsGroupedByNameFirstCharacter = Map<string, SubjectReferences>;

type SubjectsProps = {
  groupedSubjectReferences: SubjectsGroupedByNameFirstCharacter;
};

const FIRST_LETTER_NUMBER_SUBJECT_GROUP = "#";

export const Route = createFileRoute("/subjects/")({
  loader: ({ abortController }) =>
    listSubjects({ signal: abortController.signal }),
  errorComponent: SubjectsError,
  component: RouteComponent,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] border-x bg-background">
      <section className="border-b px-8 py-8 lg:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Browse By Subjects
          </h1>
        </div>

        <Separator className="mb-4 bg-border" />

        {children}
      </section>
    </div>
  );
}

function SubjectsError() {
  return (
    <Shell>
      <p className="text-sm text-muted-foreground">
        Subjects could not be loaded. Try again shortly.
      </p>
    </Shell>
  );
}

function SidebarMd({ groupedSubjectReferences }: SubjectsProps) {
  return Array.from(groupedSubjectReferences.keys()).map((char: string) => {
    const subjects = groupedSubjectReferences.get(char) || [];

    return (
      <CollapsibleSection
        title={<span className="text-2xl font-black">{char}</span>}
        containerStyles=""
      >
        <ul className="ml-8 list-disc">
          {subjects.map((subject: SubjectReference) => (
            <li>
              <Link to={SubjectRoute.to} params={{ slug: subject.slug }}>
                Game Development
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    );
  });
}

function SidebarXs({ groupedSubjectReferences }: SubjectsProps) {
  return (
    <div className="w-full">
      {/* <Select>
        <SelectTrigger className="mx-auto w-full max-w-96">
          <SelectValue placeholder="Select a Subject Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>G</SelectLabel>
            <SelectItem value="game-development">Game Development</SelectItem>
            <SelectItem value="algebra">Algebra</SelectItem>
            <SelectItem value="geometry">Geometry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select> */}
      {/* <Combobox
        multiple
        items={subjects.map((s) => {
          return {
            value: s.slug,
            label: s.name,
          };
        })}
        value={guideContData.subjects}
        onValueChange={(slugs) =>
          setGuideContData((prev) => ({
            ...prev,
            subjects: slugs,
          }))
        }
      /> */}
      {/* <Combobox /> */}
    </div>
  );
}

function Sidebar({ groupedSubjectReferences }: SubjectsProps) {
  return (
    <>
      <div className="hidden md:block">
        <SidebarMd groupedSubjectReferences={groupedSubjectReferences} />
      </div>
      <div className="md:hidden">
        <SidebarXs groupedSubjectReferences={groupedSubjectReferences} />
      </div>
    </>
  );
}

function Subjects({ subjects }: { subjects: Subjects }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:ml-4 lg:grid-cols-2">
      {subjects.map((subject) => {
        const s = {
          ...subject,
          stats: [
            { label: "Objectives", data: subject.objectives_total },
            { label: "Guides", data: subject.guides_total },
          ],
        };
        return <SubjectCard key={s.slug} subject={s} to={SubjectRoute.to} />;
      })}
    </div>
  );
}

const getSubjectNamesGroupedByFirstLetter = (
  subjects: Subjects
): SubjectsGroupedByNameFirstCharacter => {
  const subjectsGrouped: SubjectsGroupedByNameFirstCharacter = new Map();
  const isAlphabet = /^[a-z]$/i;

  if (!Array.isArray(subjects) || subjects.length === 0) return subjectsGrouped;

  const subjectsSorted = Array.from(subjects).sort((subjectA, subjectB) => {
    const a = subjectA.name.at(0) || "";
    const b = subjectB.name.at(0) || "";

    const aIsNum = /^\d+$/.test(a);
    const bIsNum = /^\d+$/.test(b);

    if (aIsNum === bIsNum) {
      // Both numbers or both alphabets
      return a.localeCompare(b);
    }

    return aIsNum ? -1 : 1; // Numbers first
  });

  subjectsSorted.map((subject: SubjectListItem) => {
    const { name } = subject;
    const firstLetter = name.at(0)?.toUpperCase() || "";

    const character = isAlphabet.test(firstLetter)
      ? firstLetter
      : FIRST_LETTER_NUMBER_SUBJECT_GROUP;
    const currentSubjects = subjectsGrouped.get(character) || [];

    subjectsGrouped.set(firstLetter, [...currentSubjects, subject]);
  });

  // const groupedSubjectsArray: Array<Array<string>> = Array.from(groupedSubjects);

  return subjectsGrouped;
};

function RouteComponent() {
  const subjects: Array<SubjectListItem> = Route.useLoaderData();

  const subjectsGroupedByNameFirstCharacter: SubjectsGroupedByNameFirstCharacter =
    useMemo(() => getSubjectNamesGroupedByFirstLetter(subjects), [subjects]);

  if (subjects.length === 0) {
    return <p className="text-sm text-muted-foreground">No subjects yet.</p>;
  }

  return (
    <Shell>
      <section className="grid border-b md:grid-cols-[320px_1fr]">
        <aside className="overflow-y-auto py-6 md:h-[calc(100vh-70px)] md:px-6">
          <Sidebar
            groupedSubjectReferences={subjectsGroupedByNameFirstCharacter}
          />
        </aside>

        <Subjects subjects={subjects} />
      </section>
    </Shell>
  );
}
