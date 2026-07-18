import { useState } from "react";
import { LayoutGrid, Users, Briefcase, CalendarCheck, Star } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminOverview } from "@/pages/admin/AdminOverview";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminServices } from "@/pages/admin/AdminServices";
import { AdminBookings } from "@/pages/admin/AdminBookings";
import { AdminReviews } from "@/pages/admin/AdminReviews";
import { ADMIN_DASHBOARD } from "@/constants/testIds";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutGrid, testId: ADMIN_DASHBOARD.overviewTab },
    { key: "users", label: "Users", icon: Users, testId: ADMIN_DASHBOARD.usersTab },
    { key: "services", label: "Services", icon: Briefcase, testId: ADMIN_DASHBOARD.servicesTab },
    { key: "bookings", label: "Bookings", icon: CalendarCheck, testId: ADMIN_DASHBOARD.bookingsTab },
    { key: "reviews", label: "Reviews", icon: Star, testId: ADMIN_DASHBOARD.reviewsTab },
  ];

  return (
    <DashboardShell title="Admin Dashboard" subtitle="Oversee users, services and bookings across QuickFix." tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && <AdminOverview />}
      {tab === "users" && <AdminUsers />}
      {tab === "services" && <AdminServices />}
      {tab === "bookings" && <AdminBookings />}
      {tab === "reviews" && <AdminReviews />}
    </DashboardShell>
  );
}
