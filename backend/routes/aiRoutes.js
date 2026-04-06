import express, { Router } from "express";
import {
  generateSummaryHandler,
  improveTextHandler,
  rewriteObjectiveHandler,
  suggestSkillsHandler,
} from "../controllers/aiController.js";

const router = Router();

router.use(express.json({ limit: "2mb" }));
router.post("/improve-text", improveTextHandler);
router.post("/generate-summary", generateSummaryHandler);
router.post("/suggest-skills", suggestSkillsHandler);
router.post("/rewrite-objective", rewriteObjectiveHandler);

export default router;
