import type { TaskStatus } from "../types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`status-badge status-badge-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
