import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router()

router.post("/login", v1.auth.user.login)
router.post("/register/verify", v1.auth.user.verifyRegistration)
router.post("/register", v1.auth.user.initRegister)
router.post("/otp", v1.auth.user.resendOtpToMail)
router.post("/password/forgot", v1.auth.user.forgotPassword)
router.post("/password/reset", v1.auth.user.resetPassword)
router.post("/token/refresh", v1.auth.user.refreshTokens)

export default router;