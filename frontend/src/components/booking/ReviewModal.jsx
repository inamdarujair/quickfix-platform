import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Loader2, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { REVIEW_MODAL } from "@/constants/testIds";

const MAX_PHOTOS = 3;

export const ReviewModal = ({ booking, open, onOpenChange, onReviewed }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setRating(0);
    setComment("");
    setPhotos([]);
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setLoading(true);
    try {
      const { data: review } = await api.post("/reviews", { booking_id: booking.id, rating, comment });
      if (photos.length) {
        const formData = new FormData();
        photos.forEach((f) => formData.append("files", f));
        await api.post(`/reviews/${review.id}/photos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("Thanks for your review!");
      reset();
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
      <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
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
                  n <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
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
          className="min-h-[90px] border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50"
        />

        <div>
          <div className="flex flex-wrap gap-2">
            {photos.map((file, i) => (
              <div key={i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-border">
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  data-testid={REVIEW_MODAL.removePhotoButton(i)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-accent">
                <ImagePlus className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  data-testid={REVIEW_MODAL.photosInput}
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Add up to {MAX_PHOTOS} photos (optional)</p>
        </div>

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

