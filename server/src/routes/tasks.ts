import { Router } from "express";
import { HttpError, parseBody, sendData } from "../http";
import { requireAuth } from "../middleware";
import { taskInputSchema, taskPriorities, taskStatuses, taskStatusSchema, uuidSchema } from "../validation";

const router = Router();
router.use(requireAuth);

function taskFromRow(row: {
  id: string; project_id: string; name: string; description: string;
  priority: "Low" | "Medium" | "High"; status: "Pending" | "In Progress" | "Completed";
  due_date: string | null; created_at: string;
}) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ?? "",
    createdAt: row.created_at,
  };
}

router.get("/", async (request, response) => {
  const search = typeof request.query.search === "string" ? request.query.search.trim().slice(0, 160) : "";
  const status = request.query.status;
  const priority = request.query.priority;
  const projectId = request.query.projectId;
  if (status && !taskStatuses.includes(String(status) as typeof taskStatuses[number])) throw new HttpError("Invalid task status filter.", 400);
  if (priority && !taskPriorities.includes(String(priority) as typeof taskPriorities[number])) throw new HttpError("Invalid task priority filter.", 400);

  let query = request.userSupabase!.from("tasks").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", String(status));
  if (priority) query = query.eq("priority", String(priority));
  if (projectId) query = query.eq("project_id", parseBody(uuidSchema, projectId));
  if (search) query = query.ilike("name", `%${search.replace(/[\\%_]/g, "\\$&")}%`);
  const { data, error } = await query;
  if (error) throw new HttpError("Could not load tasks.", 500);
  return sendData(response, (data ?? []).map((row) => taskFromRow(row)));
});

router.get("/:taskId", async (request, response) => {
  const taskId = parseBody(uuidSchema, request.params.taskId);
  const { data, error } = await request.userSupabase!.from("tasks").select("*").eq("id", taskId).maybeSingle();
  if (error) throw new HttpError("Could not load task.", 500);
  if (!data) throw new HttpError("Task not found.", 404);
  return sendData(response, taskFromRow(data));
});

router.post("/", async (request, response) => {
  const input = parseBody(taskInputSchema, request.body);
  const { data, error } = await request.userSupabase!.from("tasks").insert({
    project_id: input.projectId,
    name: input.name,
    description: input.description,
    priority: input.priority,
    status: input.status,
    due_date: input.dueDate || null,
  }).select("*").single();
  if (error || !data) throw new HttpError("Could not create task. Check that the project is yours.", 400);
  return sendData(response, taskFromRow(data), 201);
});

router.put("/:taskId", async (request, response) => {
  const taskId = parseBody(uuidSchema, request.params.taskId);
  const input = parseBody(taskInputSchema, request.body);
  const { data, error } = await request.userSupabase!.from("tasks").update({
    project_id: input.projectId,
    name: input.name,
    description: input.description,
    priority: input.priority,
    status: input.status,
    due_date: input.dueDate || null,
  }).eq("id", taskId).select("*").maybeSingle();
  if (error) throw new HttpError("Could not update task. Check that the project is yours.", 400);
  if (!data) throw new HttpError("Task not found.", 404);
  return sendData(response, taskFromRow(data));
});

router.patch("/:taskId/status", async (request, response) => {
  const taskId = parseBody(uuidSchema, request.params.taskId);
  const { status } = parseBody(taskStatusSchema, request.body);
  const { data, error } = await request.userSupabase!.from("tasks").update({ status }).eq("id", taskId).select("*").maybeSingle();
  if (error) throw new HttpError("Could not update task status.", 400);
  if (!data) throw new HttpError("Task not found.", 404);
  return sendData(response, taskFromRow(data));
});

router.delete("/:taskId", async (request, response) => {
  const taskId = parseBody(uuidSchema, request.params.taskId);
  const { data, error } = await request.userSupabase!.from("tasks").delete().eq("id", taskId).select("id").maybeSingle();
  if (error) throw new HttpError("Could not delete task.", 400);
  if (!data) throw new HttpError("Task not found.", 404);
  return response.status(204).end();
});

export default router;
