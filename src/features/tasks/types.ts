export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
};

export type TaskInput = Omit<Task, "id" | "createdAt">;

export type TaskFilters = {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
};
