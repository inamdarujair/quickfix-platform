import { useEffect, useState } from "react";
import { Loader2, Users, Briefcase, CalendarCheck, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testId="admin-stat-customers" icon={Users} label="Customers" value={stats.total_customers} delay={0} />
        <StatCard testId="admin-stat-providers" icon={Users} label="Providers" value={stats.total_providers} accent="text-emerald-400" delay={0.05} />
        <StatCard testId="admin-stat-services" icon={Briefcase} label="Active Services" value={`${stats.active_services}/${stats.total_services}`} accent="text-amber-400" delay={0.1} />
        <StatCard testId="admin-stat-revenue" icon={DollarSign} label="Total Revenue" value={`$${stats.revenue}`} accent="text-blue-400" delay={0.15} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-blue-400" />
          <h3 className="font-heading text-base font-medium text-foreground">Bookings by status</h3>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(stats.bookings_by_status).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
