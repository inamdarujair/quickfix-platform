import { Inbox } from "lucide-react";

export const EmptyState = ({ title = "Nothing here yet", description, testId }) => (
  <div data-testid={testId} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
    <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
    <p className="font-heading text-lg text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
  </div>
);
