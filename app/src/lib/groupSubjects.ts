import type { SubjectListItem, SubjectReferences } from "@bluelearn/schemas";

type Subjects = Array<SubjectListItem>;

type SubjectsGroupedByNameFirstCharacter = Map<string, SubjectReferences>;

const FIRST_LETTER_NUMBER_SUBJECT_GROUP = "#";

export const getSubjectNamesGroupedByFirstLetter = (
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

  return subjectsGrouped;
};
