export type ProjectStatus = "Not Started" | "In Progress" | "Completed";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type ProjectInput = Omit<Project, "id" | "createdAt">;

export type ProjectFilters = {
  search?: string;
  status?: ProjectStatus;
};
