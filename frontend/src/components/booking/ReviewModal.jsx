import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { REVIEW_MODAL } from "@/constants/testIds";

export const ReviewModal = ({ booking, open, onOpenChange, onReviewed }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setLoading(true);
    try {
      await api.post("/reviews", { booking_id: booking.id, rating, comment });
      toast.success("Thanks for your review!");
      setRating(0);
      setComment("");
      onOpenChange(false);
      onReviewed?.();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#12121A] text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Rate {booking?.service_title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              data-testid={REVIEW_MODAL.star(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
            >
              <Star
                size={28}
                className={cn(
                  "transition-colors",
                  n <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600"
                )}
              />
            </button>
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          data-testid={REVIEW_MODAL.commentInput}
          placeholder="Share your experience with this provider"
          className="min-h-[90px] border-white/10 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
        />

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            data-testid={REVIEW_MODAL.submitButton}
            className="w-full bg-blue-500 text-white hover:bg-blue-400"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
