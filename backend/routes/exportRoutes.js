import express, { Router } from "express";
import { exportPdfHandler } from "../controllers/exportController.js";

const router = Router();

router.use(express.json({ limit: "2mb" }));
router.post("/export-pdf", exportPdfHandler);

export default router;
