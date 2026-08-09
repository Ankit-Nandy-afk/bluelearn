import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const NotFound = () => {
  return (
    <main className="container mx-auto p-4 pt-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <img
              src="/assets/adam/adam-cube-error.png"
              alt="Adam mascot showing an error"
              className="h-40 w-40 sm:h-56 sm:w-56"
            />
          </EmptyMedia>
          <EmptyTitle className="data-label">404 - Not Found</EmptyTitle>
          <EmptyDescription className="data-value">
            The page you&apos;re looking for doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
};
