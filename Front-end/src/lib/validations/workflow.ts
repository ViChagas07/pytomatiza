/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Validations — NLP Workflow
   ═══════════════════════════════════════════════════════════════════ */

import { z } from "zod";

export const nlpWorkflowSchema = z.object({
  instruction: z
    .string()
    .min(10, { message: "errors.instructionTooShort" })
    .max(500, { message: "errors.instructionTooLong" }),
  agentType: z
    .enum(["productivity", "data", "content", "admin", "technical"])
    .optional(),
  requireApproval: z.boolean().optional(),
});

export type NLPWorkflowInput = z.infer<typeof nlpWorkflowSchema>;
