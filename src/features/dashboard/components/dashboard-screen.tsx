"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteProject, deleteTask, getDashboardSummary, listWorkspaceData, saveProject as persistProject, saveTask as persistTask, updateProjectStatus } from "@/lib/supabase/data";
import { apiRequest } from "@/lib/api";
import type { Project, ProjectInput, ProjectStatus } from "@/features/projects/types";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/features/tasks/types";

const projectStatuses: ProjectStatus[] = ["Not Started", "In Progress", "Completed"];
const taskStatuses: TaskStatus[] = ["Pending", "In Progress", "Completed"];
const priorities: TaskPriority[] = ["Low", "Medium", "High"];

function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={close} aria-label="Close">×</button></div>{children}</section></div>;
}

function ProjectForm({ project, onDone, onCancel }: { project?: Project; onDone: (input: ProjectInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "Not Started");
  const [startDate, setStartDate] = useState(project?.startDate ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(project?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (!name.trim()) return; setSaving(true); await onDone({ name: name.trim(), description: description.trim(), status, startDate, endDate }); setSaving(false); }
  return <form className="workspace-form" onSubmit={submit}><label>Project name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label><div className="form-grid"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>{projectStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label><label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : project ? "Save changes" : "Create project"}</button></div></form>;
}

function TaskForm({ task, projects, onDone, onCancel }: { task?: Task; projects: Project[]; onDone: (input: TaskInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState(task?.projectId ?? projects[0]?.id ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Pending");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "Medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (!name.trim() || !projectId) return; setSaving(true); await onDone({ name: name.trim(), description: description.trim(), projectId, status, priority, dueDate }); setSaving(false); }
  return <form className="workspace-form" onSubmit={submit}><label>Task name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label><div className="form-grid"><label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>{taskStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : task ? "Save changes" : "Create task"}</button></div></form>;
}

function getProjectStatus(tasks: Task[]): ProjectStatus {
  if (tasks.length > 0 && tasks.every((task) => task.status === "Completed")) return "Completed";
  if (tasks.some((task) => task.status !== "Pending")) return "In Progress";
  return "Not Started";
}

function isTaskLate(task: Task) {
  if (!task.dueDate || task.status === "Completed") return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return task.dueDate < today;
}

function getTaskDisplayStatus(task: Task) {
  return isTaskLate(task) ? "Late" : task.status;
}

function ProjectDetails({ project, tasks, onEditProject, onAddTask, onEditTask, onDeleteTask, error }: { project: Project; tasks: Task[]; onEditProject: () => void; onAddTask: () => void; onEditTask: (task: Task) => void; onDeleteTask: (id: string) => void; error: string }) {
  return <main className="app-shell"><section className="main-area"><div className="content project-detail"><Link className="text-button" href="/projects">← Back to projects</Link><div className="welcome-row"><div><p className="eyebrow">PROJECT DETAILS</p><h1>{project.name}</h1><p className="subheading">{project.description || "No description yet."}</p></div><div className="detail-actions"><span className={`status-badge status-badge-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span><button className="outline-button" onClick={onEditProject}>Edit project</button></div></div>{error && <p className="workspace-error" role="alert">{error}</p>}<section className="detail-summary"><div><span>Start date</span><strong>{project.startDate}</strong></div><div><span>End date</span><strong>{project.endDate || "No end date"}</strong></div><div><span>Assigned tasks</span><strong>{tasks.length}</strong></div></section><section className="tasks-section"><div className="section-heading"><div><h2>Assigned tasks</h2><p>Tasks currently linked to this project.</p></div><button className="primary-button" onClick={onAddTask}>+ Add task</button></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>TASK NAME</th><th>PRIORITY</th><th>DUE DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{tasks.map((task) => { const displayStatus = getTaskDisplayStatus(task); return <tr key={task.id}><td>{task.name}</td><td><span className={`priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td><td>{task.dueDate || "—"}</td><td><span className={`status-badge status-badge-${displayStatus.toLowerCase()}`}>{displayStatus}</span></td><td><button className="table-action" onClick={() => onEditTask(task)}>Edit</button><button className="table-action danger" onClick={() => onDeleteTask(task.id)}>Delete</button></td></tr>; })}</tbody></table>{tasks.length === 0 && <p className="empty-state">No tasks assigned to this project.</p>}</div></section></div></section></main>;
}

export default function DashboardScreen({ initialView = "Overview", projectId }: { initialView?: "Overview" | "Projects" | "My tasks"; projectId?: string }) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [userName, setUserName] = useState("there");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState("All status");
  const [taskStatus, setTaskStatus] = useState("All status");
  const [priority, setPriority] = useState("All priority");
  const [taskProject, setTaskProject] = useState("All projects");
  const [modal, setModal] = useState<"project" | "task" | null>(null);
  const [editingProject, setEditingProject] = useState<Project>();
  const [editingTask, setEditingTask] = useState<Task>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState({ totalProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, projectsInProgress: 0 });

  const load = useCallback(async () => {
    try {
      const [user, workspace, summary] = await Promise.all([
        apiRequest<{ fullName: string; email: string }>("/auth/me"),
        listWorkspaceData(),
        getDashboardSummary(),
      ]);
      setUserName(user.fullName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there");
      setProjects(workspace.projects); setTasks(workspace.tasks);
      setDashboardSummary(summary);
    } catch (caught) {
      if (caught instanceof Error && caught.message.toLowerCase().includes("session")) {
        await createSupabaseBrowserClient().auth.signOut();
        router.replace("/login");
        return;
      }
      setError(caught instanceof Error ? caught.message : "Could not load your workspace.");
    }
    finally { setLoading(false); }
  }, [router]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const projectNames = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const visibleProjects = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()) && (projectStatus === "All status" || project.status === projectStatus));
  const visibleTasks = tasks.filter((task) => `${task.name} ${projectNames.get(task.projectId) ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (taskStatus === "All status" || task.status === taskStatus) && (priority === "All priority" || task.priority === priority) && (taskProject === "All projects" || task.projectId === taskProject));
  const stats = [{ label: "Total projects", value: dashboardSummary.totalProjects }, { label: "Total tasks", value: dashboardSummary.totalTasks }, { label: "Completed tasks", value: dashboardSummary.completedTasks }, { label: "Pending tasks", value: dashboardSummary.pendingTasks }, { label: "Projects in progress", value: dashboardSummary.projectsInProgress }];

  async function refreshSummary() { try { setDashboardSummary(await getDashboardSummary()); } catch { /* Keep the last displayed summary if a refresh fails. */ } }
  async function saveProject(input: ProjectInput) { try { const saved = await persistProject(input, editingProject?.id); setProjects((current) => editingProject ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); setModal(null); setEditingProject(undefined); void refreshSummary(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save project."); } }
  async function saveTask(input: TaskInput, taskId?: string) { try { const saved = await persistTask(input, taskId ?? editingTask?.id); const previousProjectId = editingTask?.projectId; const nextTasks = taskId || editingTask ? tasks.map((item) => item.id === saved.id ? saved : item) : [saved, ...tasks]; const projectIds = [...new Set([previousProjectId, saved.projectId].filter((id): id is string => Boolean(id)))]; const updatedProjects = await Promise.all(projectIds.map(async (projectId) => { const project = projects.find((item) => item.id === projectId); if (!project) return null; const nextStatus = getProjectStatus(nextTasks.filter((task) => task.projectId === projectId)); return project.status === nextStatus ? null : updateProjectStatus(projectId, nextStatus); })); setProjects((current) => current.map((item) => updatedProjects.find((updated) => updated?.id === item.id) ?? item)); setTasks(nextTasks); setModal(null); setEditingTask(undefined); void refreshSummary(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save task."); } }
  async function deleteProjectRecord(id: string) { if (!confirm("Delete this project and all its tasks?")) return; try { await deleteProject(id); setProjects((current) => current.filter((item) => item.id !== id)); setTasks((current) => current.filter((item) => item.projectId !== id)); void refreshSummary(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete project."); } }
  async function deleteTaskRecord(id: string) { try { const deletedTask = tasks.find((task) => task.id === id); await deleteTask(id); const nextTasks = tasks.filter((item) => item.id !== id); if (deletedTask) { const project = projects.find((item) => item.id === deletedTask.projectId); if (project) { const nextStatus = getProjectStatus(nextTasks.filter((task) => task.projectId === project.id)); if (project.status !== nextStatus) { const updatedProject = await updateProjectStatus(project.id, nextStatus); setProjects((current) => current.map((item) => item.id === updatedProject.id ? updatedProject : item)); } } } setTasks(nextTasks); void refreshSummary(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete task."); } }
  async function toggleTask(task: Task) { await saveTask({ projectId: task.projectId, name: task.name, description: task.description, priority: task.priority, status: task.status === "Completed" ? "Pending" : "Completed", dueDate: task.dueDate }, task.id); }
  async function logout() { const supabase = createSupabaseBrowserClient(); try { const { data } = await supabase.auth.getSession(); if (data.session) await apiRequest<void>("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: data.session.refresh_token }) }); } catch { /* Always clear the local session if the API is unavailable. */ } finally { await supabase.auth.signOut(); router.replace("/login"); } }
  function navigate(next: "Overview" | "Projects" | "My tasks") { setView(next); setQuery(""); }

  if (loading) return <main className="loading-screen">Loading your workspace…</main>;
  if (projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (project) return <><ProjectDetails project={project} tasks={tasks.filter((task) => task.projectId === project.id)} error={error} onEditProject={() => { setEditingProject(project); setModal("project"); }} onAddTask={() => { setEditingTask(undefined); setModal("task"); }} onEditTask={(task) => { setEditingTask(task); setModal("task"); }} onDeleteTask={(id) => void deleteTaskRecord(id)} />{modal === "project" && <Modal title="Edit project" close={() => { setModal(null); setEditingProject(undefined); }}><ProjectForm project={editingProject} onDone={saveProject} onCancel={() => { setModal(null); setEditingProject(undefined); }} /></Modal>}{modal === "task" && <Modal title={editingTask ? "Edit task" : "New task"} close={() => { setModal(null); setEditingTask(undefined); }}><TaskForm task={editingTask} projects={[project]} onDone={saveTask} onCancel={() => { setModal(null); setEditingTask(undefined); }} /></Modal>}</>;
  }
  return <main className="app-shell"><aside className="sidebar"><Link className="brand" href="/dashboard"><span className="brand-mark"><span /><span /><span /><span /></span><span>taskflow</span></Link><div className="workspace-switch"><span className="workspace-avatar">{userName[0]?.toUpperCase()}</span><span className="workspace-copy"><strong>My workspace</strong><small>Personal plan</small></span></div><p className="nav-label">WORKSPACE</p><nav className="main-nav">{(["Overview", "Projects", "My tasks"] as const).map((item) => <button key={item} className={`nav-item ${view === item ? "active" : ""}`} onClick={() => navigate(item)}><span>{item === "Overview" ? "▦" : item === "Projects" ? "□" : "✓"}</span>{item}<span className="nav-count">{item === "Projects" ? projects.length : item === "My tasks" ? tasks.length : ""}</span></button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={() => void logout()}>↪ <span>Log out</span></button><div className="profile-card"><span className="profile-avatar">{userName.slice(0, 2).toUpperCase()}</span><span className="profile-copy"><strong>{userName}</strong><small>Authenticated</small></span></div></div></aside><section className="main-area"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{view}</strong></div><label className="global-search">⌕<input aria-label="Search projects and tasks" placeholder="Search anything..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></header><div className="content"><div className="welcome-row"><div><p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</p><h1>{view === "Overview" ? <>Good morning, {userName} <span className="wave">✦</span></> : view}</h1><p className="subheading">{view === "Overview" ? "Here's what's happening with your projects today." : "Plan, track, and manage your work in one place."}</p></div><button className="primary-button" onClick={() => { setEditingProject(undefined); setModal(view === "My tasks" ? "task" : "project"); }}>{view === "My tasks" ? "+ Add task" : "+ New project"}</button></div>{error && <p className="workspace-error" role="alert">{error}</p>}{view === "Overview" && <section className="stats-grid">{stats.map((stat) => <article className="stat-card" key={stat.label}><div className="stat-top"><span>{stat.label}</span></div><strong>{stat.value.toString().padStart(2, "0")}</strong><div className="stat-foot"><span>Live from Supabase</span></div></article>)}</section>}{(view === "Overview" || view === "Projects") && <section className="projects-section"><div className="section-heading"><div><h2>{view === "Overview" ? "Projects" : "All projects"}</h2><p>{visibleProjects.length} project{visibleProjects.length === 1 ? "" : "s"} in your workspace.</p></div><div className="filters"><select aria-label="Filter projects by status" value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option>All status</option>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select>{view === "Overview" && <button className="text-button" onClick={() => navigate("Projects")}>View all projects →</button>}</div></div><div className="project-grid">{visibleProjects.map((project) => <article className="project-card" key={project.id}><div className="project-card-top"><span className="project-logo violet">{project.name[0]?.toUpperCase()}</span><span className={`status-badge status-badge-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span></div>  <h3><Link className="project-link" href={`/projects/${project.id}`}>{project.name}</Link></h3><p className="project-category">{project.description || "No description yet."}</p><div className="project-created">Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div><div className="project-tasks"><strong>Assigned tasks</strong>{tasks.filter((task) => task.projectId === project.id).length > 0 ? <ul>{tasks.filter((task) => task.projectId === project.id).map((task) => <li key={task.id}><span>{task.name}</span><span className={`status-badge status-badge-${getTaskDisplayStatus(task).toLowerCase()}`}>{getTaskDisplayStatus(task)}</span></li>)}</ul> : <p>No tasks assigned.</p>}</div><div className="project-card-footer"><span>{tasks.filter((task) => task.projectId === project.id).length} tasks</span><span className="project-actions"><button onClick={() => { setEditingProject(project); setModal("project"); }}>Edit</button><button onClick={() => void deleteProjectRecord(project.id)}>Delete</button></span></div></article>)}</div>{visibleProjects.length === 0 && <p className="empty-state">No projects match your search.</p>}</section>}{(view === "Overview" || view === "My tasks") && <section className="tasks-section"><div className="section-heading task-heading"><div><h2>My tasks <span className="task-total">{visibleTasks.length}</span></h2><p>Keep a clear view of everything that needs attention.</p></div><div className="filters"><select aria-label="Filter tasks by project" value={taskProject} onChange={(event) => setTaskProject(event.target.value)}><option>All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><select aria-label="Filter tasks by status" value={taskStatus} onChange={(event) => setTaskStatus(event.target.value)}><option>All status</option>{taskStatuses.map((status) => <option key={status}>{status}</option>)}</select><select aria-label="Filter tasks by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>All priority</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select></div></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>TASK NAME</th><th>PROJECT</th><th>PRIORITY</th><th>DUE DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task.id}><td><button className={`task-check ${task.status === "Completed" ? "is-done" : ""}`} onClick={() => void toggleTask(task)} aria-label={`Mark ${task.name} ${task.status === "Completed" ? "incomplete" : "complete"}`}>✓</button>{task.name}</td><td>{projectNames.get(task.projectId) ?? "Unknown project"}</td><td><span className={`priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td><td>{task.dueDate || "—"}</td><td><span className={`status-badge status-badge-${getTaskDisplayStatus(task).toLowerCase()}`}>{getTaskDisplayStatus(task)}</span></td><td><button className="table-action" onClick={() => { setEditingTask(task); setModal("task"); }}>Edit</button><button className="table-action danger" onClick={() => void deleteTaskRecord(task.id)}>Delete</button></td></tr>)}</tbody></table>{visibleTasks.length === 0 && <p className="empty-state">No tasks match your filters.</p>}</div></section>}</div></section>{modal === "project" && <Modal title={editingProject ? "Edit project" : "New project"} close={() => { setModal(null); setEditingProject(undefined); }}><ProjectForm project={editingProject} onDone={saveProject} onCancel={() => setModal(null)} /></Modal>}{modal === "task" && <Modal title={editingTask ? "Edit task" : "New task"} close={() => { setModal(null); setEditingTask(undefined); }}><TaskForm task={editingTask} projects={projects} onDone={saveTask} onCancel={() => setModal(null)} /></Modal>}</main>;
}
