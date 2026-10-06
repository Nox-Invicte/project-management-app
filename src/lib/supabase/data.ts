import type { Project, ProjectInput } from "@/features/projects/types";
import type { Task, TaskInput } from "@/features/tasks/types";
import { createSupabaseBrowserClient } from "./client";

type ProjectRow = { id: string; name: string; description: string; status: Project["status"]; start_date: string; end_date: string | null; created_at: string };
type TaskRow = { id: string; project_id: string; name: string; description: string; priority: Task["priority"]; status: Task["status"]; due_date: string | null; created_at: string };

const projectFromRow = (row: ProjectRow): Project => ({ id: row.id, name: row.name, description: row.description, status: row.status, startDate: row.start_date, endDate: row.end_date ?? "", createdAt: row.created_at });
const taskFromRow = (row: TaskRow): Task => ({ id: row.id, projectId: row.project_id, name: row.name, description: row.description, priority: row.priority, status: row.status, dueDate: row.due_date ?? "", createdAt: row.created_at });

function ensure(error: { message: string } | null) { if (error) throw new Error(error.message); }

export async function listWorkspaceData() {
  const supabase = createSupabaseBrowserClient();
  const [projects, tasks] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
  ]);
  ensure(projects.error); ensure(tasks.error);
  return { projects: (projects.data as ProjectRow[]).map(projectFromRow), tasks: (tasks.data as TaskRow[]).map(taskFromRow) };
}

export async function saveProject(input: ProjectInput, id?: string) {
  const supabase = createSupabaseBrowserClient();
  const values = { name: input.name, description: input.description, status: input.status, start_date: input.startDate, end_date: input.endDate || null };
  const query = id ? supabase.from("projects").update(values).eq("id", id) : supabase.from("projects").insert(values);
  const result = await query.select().single();
  ensure(result.error);
  return projectFromRow(result.data as ProjectRow);
}

export async function saveTask(input: TaskInput, id?: string) {
  const supabase = createSupabaseBrowserClient();
  const values = { project_id: input.projectId, name: input.name, description: input.description, priority: input.priority, status: input.status, due_date: input.dueDate || null };
  const query = id ? supabase.from("tasks").update(values).eq("id", id) : supabase.from("tasks").insert(values);
  const result = await query.select().single();
  ensure(result.error);
  return taskFromRow(result.data as TaskRow);
}

export async function deleteProject(id: string) { const { error } = await createSupabaseBrowserClient().from("projects").delete().eq("id", id); ensure(error); }
export async function deleteTask(id: string) { const { error } = await createSupabaseBrowserClient().from("tasks").delete().eq("id", id); ensure(error); }
