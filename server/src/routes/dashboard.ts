import { Router } from "express";
import { HttpError, sendData } from "../http";
import { requireAuth } from "../middleware";

const router = Router();
router.use(requireAuth);

router.get("/", async (request, response) => {
  const supabase = request.userSupabase!;
  const [projects, tasks] = await Promise.all([
    supabase.from("projects").select("id,status"),
    supabase.from("tasks").select("id,status"),
  ]);
  if (projects.error || tasks.error) throw new HttpError("Could not load dashboard data.", 500);

  const projectRows = projects.data ?? [];
  const taskRows = tasks.data ?? [];
  return sendData(response, {
    totalProjects: projectRows.length,
    totalTasks: taskRows.length,
    completedTasks: taskRows.filter((task) => task.status === "Completed").length,
    pendingTasks: taskRows.filter((task) => task.status === "Pending").length,
    projectsInProgress: projectRows.filter((project) => project.status === "In Progress").length,
  });
});

export default router;
