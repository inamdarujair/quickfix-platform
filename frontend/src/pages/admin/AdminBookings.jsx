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
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-[#12121A] text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-[#1C1C22]">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 text-zinc-200">{b.service_title}</td>
              <td className="px-4 py-3 text-zinc-400">{b.customer_name}</td>
              <td className="px-4 py-3 text-zinc-400">{b.provider_name}</td>
              <td className="px-4 py-3 text-zinc-400">{b.scheduled_date} · {b.scheduled_time}</td>
              <td className="px-4 py-3 text-zinc-300">${b.price}</td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
