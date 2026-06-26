import { Router, type IRouter } from "express";
import healthRouter from "./health";
import correctionsRouter from "./corrections";
import newsRouter from "./news";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(correctionsRouter);
router.use(newsRouter);
router.use(stripeRouter);

export default router;
