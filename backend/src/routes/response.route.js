import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";
import {
  submitResponse,
  getFormResponses,
  checkUserResponse,
} from "../controllers/response.controller.js";

const router = express.Router();

router.post("/submit/:formId", optionalAuth, submitResponse);

router.get("/check/:formId", optionalAuth, checkUserResponse);

router.get("/form/:formId", protectRoute, getFormResponses);

export default router;
