import { Router, type IRouter } from "express";
import healthRouter from "./health";
import consultantsRouter from "./consultants";
import dashboardRouter from "./dashboard";
import matchingRouter from "./matching";
import clientsRouter from "./clients";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use(consultantsRouter);
router.use(dashboardRouter);
router.use(matchingRouter);
router.use(clientsRouter);
router.use(projectsRouter);

export default router;
