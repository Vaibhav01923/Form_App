import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  createForm,
  editForm,
  getFormById,
  getForms,
  getPublicForm,
  uploadImage,
} from "../controllers/form.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createForm);
router.get("/get", protectRoute, getForms);
router.get("/get/:id", protectRoute, getFormById);
router.get("/getPublic/:id", getPublicForm);
router.put("/edit/:id", protectRoute, editForm);
router.post("/upload-image", protectRoute, uploadImage);

export default router;
