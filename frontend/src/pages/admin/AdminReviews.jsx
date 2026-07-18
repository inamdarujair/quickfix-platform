import { useEffect, useState } from "react";
import { Loader2, Star, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/components/ui/sonner";
import { api, resolveImage, formatApiError } from "@/lib/api";
import { ADMIN_REVIEW_ROW } from "@/constants/testIds";

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/reviews")
      .then(({ data }) => setReviews(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" description="Customer reviews will show up here once bookings are completed and reviewed." testId="admin-reviews-empty" />;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 font-heading text-sm font-medium text-blue-400">
                {r.customer_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{r.customer_name}</p>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <ShieldCheck className="h-3 w-3" /> Verified Customer
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  on <span className="text-foreground/80">{r.service_title}</span> · {new Date(r.created_at).toLocaleDateString()}
                </p>
                <div className="mt-1.5 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"}`} />
                  ))}
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.photos.map((path, i) => (
                      <img key={i} src={resolveImage({ images: [path] })} alt="Review attachment" className="h-14 w-14 rounded-lg border border-border object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(r.id)}
              data-testid={ADMIN_REVIEW_ROW.deleteButton(r.id)}
              className="shrink-0 border-border bg-transparent text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
