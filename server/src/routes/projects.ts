import { Router } from "express";
import { HttpError, parseBody, sendData } from "../http";
import { requireAuth } from "../middleware";
import { projectInputSchema, projectStatusSchema, uuidSchema } from "../validation";

const router = Router();
router.use(requireAuth);

function projectFromRow(row: {
  id: string; name: string; description: string; status: "Not Started" | "In Progress" | "Completed";
  start_date: string; end_date: string | null; created_at: string;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date ?? "",
    createdAt: row.created_at,
  };
}

router.get("/", async (request, response) => {
  const status = request.query.status;
  if (status && !projectInputSchema.shape.status.safeParse(status).success) {
    throw new HttpError("Invalid project status filter.", 400);
  }
  const search = typeof request.query.search === "string" ? request.query.search.trim().slice(0, 120) : "";
  let query = request.userSupabase!.from("projects").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", String(status));
  if (search) query = query.ilike("name", `%${search.replace(/[\\%_]/g, "\\$&")}%`);
  const { data, error } = await query;
  if (error) throw new HttpError("Could not load projects.", 500);
  return sendData(response, (data ?? []).map((row) => projectFromRow(row)));
});

router.get("/:projectId", async (request, response) => {
  const projectId = parseBody(uuidSchema, request.params.projectId);
  const { data, error } = await request.userSupabase!.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (error) throw new HttpError("Could not load project.", 500);
  if (!data) throw new HttpError("Project not found.", 404);
  return sendData(response, projectFromRow(data));
});

router.post("/", async (request, response) => {
  const input = parseBody(projectInputSchema, request.body);
  const { data, error } = await request.userSupabase!.from("projects").insert({
    name: input.name,
    description: input.description,
    status: input.status,
    ...(input.startDate ? { start_date: input.startDate } : {}),
    end_date: input.endDate || null,
  }).select("*").single();
  if (error || !data) throw new HttpError("Could not create project.", 400);
  return sendData(response, projectFromRow(data), 201);
});

router.put("/:projectId", async (request, response) => {
  const projectId = parseBody(uuidSchema, request.params.projectId);
  const input = parseBody(projectInputSchema, request.body);
  const { data, error } = await request.userSupabase!.from("projects").update({
    name: input.name,
    description: input.description,
    status: input.status,
    ...(input.startDate ? { start_date: input.startDate } : {}),
    end_date: input.endDate || null,
  }).eq("id", projectId).select("*").maybeSingle();
  if (error) throw new HttpError("Could not update project.", 400);
  if (!data) throw new HttpError("Project not found.", 404);
  return sendData(response, projectFromRow(data));
});

router.patch("/:projectId/status", async (request, response) => {
  const projectId = parseBody(uuidSchema, request.params.projectId);
  const { status } = parseBody(projectStatusSchema, request.body);
  const { data, error } = await request.userSupabase!.from("projects").update({ status }).eq("id", projectId).select("*").maybeSingle();
  if (error) throw new HttpError("Could not update project status.", 400);
  if (!data) throw new HttpError("Project not found.", 404);
  return sendData(response, projectFromRow(data));
});

router.delete("/:projectId", async (request, response) => {
  const projectId = parseBody(uuidSchema, request.params.projectId);
  const { data, error } = await request.userSupabase!.from("projects").delete().eq("id", projectId).select("id").maybeSingle();
  if (error) throw new HttpError("Could not delete project.", 400);
  if (!data) throw new HttpError("Project not found.", 404);
  return response.status(204).end();
});

export default router;
