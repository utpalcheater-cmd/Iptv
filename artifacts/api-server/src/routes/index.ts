import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workspaceRouter from "./workspace";
import projectsRouter from "./projects";
import activityRouter from "./activity";
import agentRouter from "./agent";
import { requireNabeenOwner } from "../middlewares/nabeenOwner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workspaceRouter);
router.use(requireNabeenOwner);
router.use(projectsRouter);
router.use(activityRouter);
router.use(agentRouter);

export default router;
