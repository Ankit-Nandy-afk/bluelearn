import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <main className="container mx-auto p-4 pt-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <img
              src="/assets/adam/adam-cube-error.png"
              alt="Adam mascot showing an error"
              className="h-40 w-40 grayscale sm:h-56 sm:w-56"
            />
          </EmptyMedia>
          <EmptyTitle className="data-label">Something went wrong</EmptyTitle>
          <EmptyDescription className="data-value">
            {error.message || "An unexpected error occurred."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
};
