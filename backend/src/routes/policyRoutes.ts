import { Router } from "express";
import {
  listPolicies,
  updatePolicy,
  createPolicy,
} from "../controllers/policyController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

export const policyRoutes = Router();
policyRoutes.get("/", authenticate, listPolicies);

export const adminPolicyRoutes = Router();
adminPolicyRoutes.use(authenticate, requireAdmin);

adminPolicyRoutes.post("/", createPolicy);
adminPolicyRoutes.patch("/:id", updatePolicy);