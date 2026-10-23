interface TaskWorkspaceProps {
  moduleTitle: string;
  taskBrief: string;
  moduleSlug: string;
}

export function TaskWorkspace({
  moduleTitle,
  taskBrief,
  moduleSlug,
}: TaskWorkspaceProps) {
  return (
    <main className="mx-auto flex min-h-[55vh] w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
        Build task · {moduleSlug}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {moduleTitle}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {taskBrief}
      </p>
      <p className="mt-8 border-l-2 border-primary/40 pl-4 text-sm leading-6 text-muted-foreground">
        The interactive workspace is still being built. Your task and lesson
        content will be available here when it is ready.
      </p>
    </main>
  );
}
