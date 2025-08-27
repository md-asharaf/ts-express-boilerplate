import { Router } from "express";
import { authenticateAdmin } from "@/middlewares/admin.middleware";

const router = Router();

router.use(authenticateAdmin);

// add admin authenticated routes here

export default router;
