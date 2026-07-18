import { Inbox } from "lucide-react";

export const EmptyState = ({ title = "Nothing here yet", description, testId }) => (
  <div data-testid={testId} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
    <Inbox className="mb-4 h-10 w-10 text-zinc-600" />
    <p className="font-heading text-lg text-zinc-300">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
  </div>
);
