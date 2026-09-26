import { desc, eq } from "drizzle-orm";
import { db, activityTable, projectsTable } from "@workspace/db";
import type { Activity, Project } from "@workspace/db";

const seedProjects = [
  {
    id: "project-nabeen-home",
    name: "nabeen-home",
    slug: "nabeen-home",
    description: "Your first nabeen workspace — a place to make ideas real.",
    language: "TypeScript",
    status: "active",
    visibility: "private",
    accent: "violet",
  },
  {
    id: "project-pulse",
    name: "pulse-board",
    slug: "pulse-board",
    description: "A calm, fast dashboard for tracking the work that matters.",
    language: "React",
    status: "active",
    visibility: "public",
    accent: "cyan",
  },
  {
    id: "project-archive",
    name: "weekend-lab",
    slug: "weekend-lab",
    description: "Experiments, sketches, and ideas waiting for their next pass.",
    language: "Python",
    status: "archived",
    visibility: "private",
    accent: "amber",
  },
];

const seedActivity = [
  {
    id: "activity-welcome",
    type: "project_created",
    title: "Welcome to nabeen",
    detail: "Your workspace is ready for its first build.",
    projectName: "nabeen-home",
  },
  {
    id: "activity-pulse",
    type: "deployment",
    title: "pulse-board is live",
    detail: "The latest version was published successfully.",
    projectName: "pulse-board",
  },
  {
    id: "activity-collab",
    type: "collaborator",
    title: "Workspace foundations added",
    detail: "Projects, activity, and capability discovery are now connected.",
    projectName: null,
  },
];

let seedPromise: Promise<void> | undefined;

export function ensureSeeded(): Promise<void> {
  seedPromise ??= (async () => {
    const existing = await db.select({ id: projectsTable.id }).from(projectsTable).limit(1);
    if (existing.length === 0) {
      await db.insert(projectsTable).values(seedProjects);
    }

    const existingActivity = await db.select({ id: activityTable.id }).from(activityTable).limit(1);
    if (existingActivity.length === 0) {
      await db.insert(activityTable).values(seedActivity);
    }
  })();

  return seedPromise;
}

export async function getRecentProjects(limit = 3): Promise<Project[]> {
  await ensureSeeded();
  return db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt)).limit(limit);
}

export async function getRecentActivity(limit = 10): Promise<Activity[]> {
  await ensureSeeded();
  return db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(limit);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  await ensureSeeded();
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  return project;
}