import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, activityTable, projectsTable } from "@workspace/db";
import {
  CreateProjectBody,
  CreateProjectResponse,
  DeleteProjectParams,
  GetProjectParams,
  GetProjectResponse,
  ListProjectsQueryParams,
  ListProjectsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
} from "@workspace/api-zod";
import { ensureSeeded, getProjectById } from "../lib/seed";

const router: IRouter = Router();
const accents = ["violet", "cyan", "amber", "coral", "mint"];

router.get("/projects", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, status } = parsed.data;
  const filters = [];
  if (status !== "all") filters.push(eq(projectsTable.status, status));
  if (q) {
    filters.push(or(ilike(projectsTable.name, `%${q}%`), ilike(projectsTable.description, `%${q}%`)));
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(projectsTable.updatedAt));
  res.json(ListProjectsResponse.parse(projects));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slugBase = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const id = `project-${Date.now()}`;
  const project = {
    id,
    name: parsed.data.name.trim(),
    slug: `${slugBase}-${id.slice(-6)}`,
    description: parsed.data.description ?? "",
    language: parsed.data.language,
    status: "active",
    visibility: parsed.data.visibility ?? "private",
    accent: accents[Math.floor(Math.random() * accents.length)],
  } as const;

  const [created] = await db.insert(projectsTable).values(project).returning();
  await db.insert(activityTable).values({
    id: `activity-${Date.now()}`,
    type: "project_created",
    title: `${created.name} created`,
    detail: "A new project was added to your workspace.",
    projectName: created.name,
  });
  res.status(201).json(CreateProjectResponse.parse(created));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const project = await getProjectById(params.data.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(project));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  const body = UpdateProjectBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(projectsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await db.insert(activityTable).values({
    id: `activity-${Date.now()}`,
    type: updated.status === "archived" ? "project_archived" : "project_updated",
    title: `${updated.name} updated`,
    detail: updated.status === "archived" ? "The project was archived." : "Project settings were updated.",
    projectName: updated.name,
  });
  res.json(UpdateProjectResponse.parse(updated));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;