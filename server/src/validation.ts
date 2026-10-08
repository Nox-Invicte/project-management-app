import { z } from "zod";

const dateOnly = z.iso.date();

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export const projectStatuses = ["Not Started", "In Progress", "Completed"] as const;
export const taskStatuses = ["Pending", "In Progress", "Completed"] as const;
export const taskPriorities = ["Low", "Medium", "High"] as const;

export const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(projectStatuses).default("Not Started"),
  startDate: dateOnly.optional(),
  endDate: dateOnly.nullable().optional(),
}).refine((input) => !input.endDate || !input.startDate || input.endDate >= input.startDate, {
  message: "End date must be on or after the start date.",
  path: ["endDate"],
});

export const taskInputSchema = z.object({
  projectId: z.uuid(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default(""),
  priority: z.enum(taskPriorities).default("Medium"),
  status: z.enum(taskStatuses).default("Pending"),
  dueDate: dateOnly.nullable().optional(),
});

export const projectStatusSchema = z.object({ status: z.enum(projectStatuses) });
export const taskStatusSchema = z.object({ status: z.enum(taskStatuses) });
export const uuidSchema = z.uuid();
