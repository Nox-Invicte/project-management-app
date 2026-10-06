import DashboardScreen from "@/features/dashboard/components/dashboard-screen";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  await params;
  return <DashboardScreen initialView="My tasks" />;
}
