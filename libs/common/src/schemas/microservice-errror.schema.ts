import { z } from 'zod';

/**
 * Runtime schema
 */
export const MicroserviceErrorSchema = z
  .object({
    message: z.union([z.string(), z.array(z.string())]),
    error: z.string(),
    statusCode: z.union([z.number(), z.string()]),
    status: z.union([z.number(), z.string()]).optional(),
    timestamp: z.string(),
    code: z.string().optional(),
  })
  .catchall(z.any());

/**
 * TypeScript type (auto inferred from schema)
 */
export type MicroserviceError = z.infer<typeof MicroserviceErrorSchema>;
