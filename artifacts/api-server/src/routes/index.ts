import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import alertsRouter from "./alerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsRouter);
router.use(alertsRouter);

export default router;
