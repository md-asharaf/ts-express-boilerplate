import { Router } from "express";
import { authenticateUser } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authenticateUser);

// add user authenticated routes here

export default router;
