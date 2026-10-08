import type { Project, ProjectInput } from "@/features/projects/types";
import type { Task, TaskInput, TaskStatus } from "@/features/tasks/types";
import { apiRequest } from "@/lib/api";

export async function listWorkspaceData() {
  const [projects, tasks] = await Promise.all([
    apiRequest<Project[]>("/projects"),
    apiRequest<Task[]>("/tasks"),
  ]);
  return { projects, tasks };
}

export async function saveProject(input: ProjectInput, id?: string) {
  return apiRequest<Project>(id ? `/projects/${id}` : "/projects", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
}

export async function saveTask(input: TaskInput, id?: string) {
  return apiRequest<Task>(id ? `/tasks/${id}` : "/tasks", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProjectStatus(id: string, status: Project["status"]) {
  return apiRequest<Project>(`/projects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return apiRequest<Task>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteProject(id: string) {
  return apiRequest<void>(`/projects/${id}`, { method: "DELETE" });
}

export async function deleteTask(id: string) {
  return apiRequest<void>(`/tasks/${id}`, { method: "DELETE" });
}

export async function getDashboardSummary() {
  return apiRequest<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    projectsInProgress: number;
  }>("/dashboard");
}
