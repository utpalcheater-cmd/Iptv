import { Router, type IRouter } from "express";
import { count, desc, eq } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  GetCapabilitiesResponse,
  GetDashboardResponse,
} from "@workspace/api-zod";
import { ensureSeeded, getRecentActivity, getRecentProjects } from "../lib/seed";

const router: IRouter = Router();

const capabilities = [
  {
    id: "projects",
    label: "Projects",
    description: "Create, organize, and revisit every build from one workspace.",
    status: "available",
    category: "Workspace",
  },
  {
    id: "ai-builder",
    label: "AI builder",
    description: "A focused space for turning a plain-language idea into a working build.",
    status: "available",
    category: "Build",
  },
  {
    id: "editor",
    label: "Code workspace",
    description: "A future-ready home for files, code, previews, and project tools.",
    status: "coming_soon",
    category: "Build",
  },
  {
    id: "deployments",
    label: "Deployments",
    description: "Ship your work to a live URL when your project is ready.",
    status: "coming_soon",
    category: "Ship",
  },
  {
    id: "collaboration",
    label: "Collaboration",
    description: "Invite people, share context, and build together in real time.",
    status: "coming_soon",
    category: "Team",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect the services your workflow already depends on.",
    status: "coming_soon",
    category: "Connect",
  },
] as const;

router.get("/dashboard", async (_req, res): Promise<void> => {
  await ensureSeeded();
  const [{ totalProjects }] = await db.select({ totalProjects: count() }).from(projectsTable);
  const [{ activeProjects }] = await db.select({ activeProjects: count() }).from(projectsTable).where(eq(projectsTable.status, "active"));
  const [featuredProject] = await db.select().from(projectsTable).where(eq(projectsTable.status, "active")).orderBy(desc(projectsTable.updatedAt)).limit(1);
  const recentActivity = await getRecentActivity(4);
  const data = {
    greeting: "Good morning, Nabeen",
    stats: {
      totalProjects: Number(totalProjects),
      activeProjects: Number(activeProjects),
      deployments: 1,
      storageUsed: "1.8 GB",
    },
    featuredProject: featuredProject ?? null,
    recentActivity,
  };
  res.json(GetDashboardResponse.parse(data));
});

router.get("/capabilities", (_req, res): void => {
  res.json(GetCapabilitiesResponse.parse(capabilities));
});

export default router;