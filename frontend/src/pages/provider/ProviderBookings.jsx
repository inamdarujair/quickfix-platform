import { useEffect, useState } from "react";
import { Loader2, Calendar, MapPin, Phone, Check, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { PROVIDER_BOOKING_ROW } from "@/constants/testIds";

export const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/provider/bookings", { params: { status: status !== "all" ? status : undefined } })
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/provider/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="border-white/10 bg-transparent text-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#1C1C22] text-white">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" description="Bookings for your services will show up here." testId="provider-bookings-empty" />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1C1C22] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-medium text-white">{b.service_title}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-500">for {b.customer_name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {b.scheduled_date} · {b.scheduled_time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {b.address}</span>
                  {b.customer_phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {b.customer_phone}</span>}
                  <span className="font-medium text-zinc-300">${b.price}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {b.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")} data-testid={PROVIDER_BOOKING_ROW.confirmButton(b.id)} className="bg-blue-500 text-white hover:bg-blue-400">
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "rejected")} data-testid={PROVIDER_BOOKING_ROW.rejectButton(b.id)} className="border-white/10 bg-transparent text-red-400 hover:bg-red-500/10">
                      <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <Button size="sm" onClick={() => updateStatus(b.id, "completed")} data-testid={PROVIDER_BOOKING_ROW.completeButton(b.id)} className="bg-emerald-500 text-white hover:bg-emerald-400">
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
