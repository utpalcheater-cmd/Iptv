import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workspaceRouter from "./workspace";
import projectsRouter from "./projects";
import activityRouter from "./activity";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workspaceRouter);
router.use(projectsRouter);
router.use(activityRouter);

export default router;
