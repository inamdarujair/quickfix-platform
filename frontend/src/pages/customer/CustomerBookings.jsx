import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api";

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/bookings/my")
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return <EmptyState title="No bookings yet" description="Browse services and make your first booking." testId="customer-bookings-empty" />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} onChanged={load} />
      ))}
    </div>
  );
};
