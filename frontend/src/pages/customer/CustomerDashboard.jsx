import { useState } from "react";
import { CalendarCheck, User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CustomerBookings } from "@/pages/customer/CustomerBookings";
import { CustomerProfile } from "@/pages/customer/CustomerProfile";
import { useAuth } from "@/context/AuthContext";
import { CUSTOMER_DASHBOARD } from "@/constants/testIds";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("bookings");

  const tabs = [
    { key: "bookings", label: "My Bookings", icon: CalendarCheck, testId: CUSTOMER_DASHBOARD.bookingsTab },
    { key: "profile", label: "Profile", icon: User, testId: CUSTOMER_DASHBOARD.profileTab },
  ];

  return (
    <DashboardShell title={`Welcome, ${user?.name?.split(" ")[0]}`} subtitle="Manage your bookings and profile." tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "bookings" ? <CustomerBookings /> : <CustomerProfile />}
    </DashboardShell>
  );
}
