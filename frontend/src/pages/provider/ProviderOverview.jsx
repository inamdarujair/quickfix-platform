import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Clock, DollarSign } from "lucide-react";
import { Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";

export const ProviderOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/provider/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard testId="provider-stat-services" icon={Briefcase} label="Active Services" value={stats.total_services} delay={0} />
      <StatCard testId="provider-stat-pending" icon={Clock} label="Pending Bookings" value={stats.pending_bookings} accent="text-amber-400" delay={0.05} />
      <StatCard testId="provider-stat-completed" icon={CalendarCheck} label="Completed Jobs" value={stats.completed_bookings} accent="text-emerald-400" delay={0.1} />
      <StatCard testId="provider-stat-earnings" icon={DollarSign} label="Total Earnings" value={`$${stats.earnings}`} accent="text-blue-400" delay={0.15} />
    </div>
  );
};
