import express, { Router } from "express";
import { previewGithubImportHandler, previewPdfImportHandler } from "../controllers/importController.js";

const router = Router();

router.post("/github", express.json({ limit: "2mb" }), previewGithubImportHandler);
router.post("/pdf", express.json({ limit: "8mb" }), previewPdfImportHandler);

export default router;
