import { cn } from "@/lib/utils";
import { BOOKING_STATUS_STYLES } from "@/constants/categories";

export const StatusBadge = ({ status, testId }) => {
  const style = BOOKING_STATUS_STYLES[status] || BOOKING_STATUS_STYLES.pending;
  return (
    <span
      data-testid={testId}
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide", style.className)}
    >
      {style.label}
    </span>
  );
};
