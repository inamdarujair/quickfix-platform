import { useState } from "react";
import { LayoutGrid, Briefcase, CalendarCheck, User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProviderOverview } from "@/pages/provider/ProviderOverview";
import { ProviderServices } from "@/pages/provider/ProviderServices";
import { ProviderBookings } from "@/pages/provider/ProviderBookings";
import { ProviderProfile } from "@/pages/provider/ProviderProfile";
import { useAuth } from "@/context/AuthContext";
import { PROVIDER_DASHBOARD } from "@/constants/testIds";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutGrid, testId: PROVIDER_DASHBOARD.overviewTab },
    { key: "services", label: "My Services", icon: Briefcase, testId: PROVIDER_DASHBOARD.servicesTab },
    { key: "bookings", label: "Bookings", icon: CalendarCheck, testId: PROVIDER_DASHBOARD.bookingsTab },
    { key: "profile", label: "Profile", icon: User, testId: PROVIDER_DASHBOARD.profileTab },
  ];

  return (
    <DashboardShell title={`${user?.name}'s Dashboard`} subtitle="Manage your services, bookings and earnings." tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && <ProviderOverview />}
      {tab === "services" && <ProviderServices />}
      {tab === "bookings" && <ProviderBookings />}
      {tab === "profile" && <ProviderProfile />}
    </DashboardShell>
  );
}
