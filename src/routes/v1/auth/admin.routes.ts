import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router()

router.post("/login", v1.auth.admin.login)
router.post("/login/verify", v1.auth.admin.verifyLogin)

export default router;