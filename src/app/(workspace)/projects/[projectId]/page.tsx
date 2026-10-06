import DashboardScreen from "@/features/dashboard/components/dashboard-screen";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  await params;
  return <DashboardScreen initialView="Projects" />;
}
