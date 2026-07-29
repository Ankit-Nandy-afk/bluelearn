import { SubjectsPage } from "@/routes/subjects.index";

export const SubjectsLoadError = () => {
  return (
    <SubjectsPage>
      <p className="text-sm text-muted-foreground">
        Subjects could not be loaded. Try again shortly.
      </p>
    </SubjectsPage>
  );
};

export const NoSubjectsError = () => {
  return (
    <SubjectsPage>
      <p className="text-sm text-muted-foreground">No subjects yet.</p>;
    </SubjectsPage>
  );
};
