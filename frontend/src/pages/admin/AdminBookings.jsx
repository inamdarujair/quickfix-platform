import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/bookings").then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 text-foreground">{b.service_title}</td>
              <td className="px-4 py-3 text-muted-foreground">{b.customer_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{b.provider_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{b.scheduled_date} · {b.scheduled_time}</td>
              <td className="px-4 py-3 text-foreground/80">${b.price}</td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
