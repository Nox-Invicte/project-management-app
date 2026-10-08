import DashboardScreen from "@/features/dashboard/components/dashboard-screen";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <DashboardScreen initialView="Projects" projectId={projectId} />;
}
