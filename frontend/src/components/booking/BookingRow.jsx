import { useState } from "react";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { BOOKING_ROW } from "@/constants/testIds";

export const BookingRow = ({ booking, onChanged }) => {
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/bookings/${booking.id}/cancel`);
      toast.success("Booking cancelled");
      onChanged?.();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1C1C22] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-medium text-white">{booking.service_title}</h3>
          <StatusBadge status={booking.status} testId={BOOKING_ROW.statusBadge(booking.id)} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">with {booking.provider_name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {booking.scheduled_date} · {booking.scheduled_time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {booking.address}
          </span>
          <span className="font-medium text-zinc-300">${booking.price}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {booking.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            disabled={cancelling}
            onClick={handleCancel}
            data-testid={BOOKING_ROW.cancelButton(booking.id)}
            className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5"
          >
            {cancelling && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Cancel
          </Button>
        )}
        {booking.status === "completed" && !booking.has_review && (
          <Button
            size="sm"
            onClick={() => setReviewOpen(true)}
            data-testid={BOOKING_ROW.reviewButton(booking.id)}
            className="bg-blue-500 text-white hover:bg-blue-400"
          >
            Leave Review
          </Button>
        )}
        {booking.status === "completed" && booking.has_review && (
          <span className="text-xs text-zinc-500">Reviewed</span>
        )}
      </div>
      <ReviewModal booking={booking} open={reviewOpen} onOpenChange={setReviewOpen} onReviewed={onChanged} />
    </div>
  );
};
