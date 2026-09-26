import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, activityTable } from "@workspace/db";
import { ListActivityQueryParams, ListActivityResponse } from "@workspace/api-zod";
import { ensureSeeded } from "../lib/seed";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(parsed.data.limit);
  res.json(ListActivityResponse.parse(activities));
});

export default router;