import { Router, type IRouter } from "express";
import healthRouter from "./health";
import correctionsRouter from "./corrections";

const router: IRouter = Router();

router.use(healthRouter);
router.use(correctionsRouter);

export default router;
