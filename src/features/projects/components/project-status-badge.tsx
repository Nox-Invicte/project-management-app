import type { ProjectStatus } from "../types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`status-badge status-badge-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
