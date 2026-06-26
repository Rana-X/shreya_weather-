import { Router, type IRouter } from "express";
import healthRouter from "./health";
import correctionsRouter from "./corrections";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(correctionsRouter);
router.use(newsRouter);

export default router;
