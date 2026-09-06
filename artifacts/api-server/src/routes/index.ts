import { Router, type IRouter } from "express";
import healthRouter from "./health";
import consultantsRouter from "./consultants";
import dashboardRouter from "./dashboard";
import matchingRouter from "./matching";

const router: IRouter = Router();

router.use(healthRouter);
router.use(consultantsRouter);
router.use(dashboardRouter);
router.use(matchingRouter);

export default router;
