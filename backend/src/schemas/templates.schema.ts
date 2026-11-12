import { z } from 'zod';
import { TemplateType } from '@prisma/client';

export const createTemplateSchema = z.object({
  key: z.string().trim().min(2).max(100).regex(/^[a-z0-9_]+$/),
  name: z.string().trim().min(2).max(200),
  type: z.nativeEnum(TemplateType),
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(500000),
  variables: z.array(z.string().max(100)).max(100).optional(),
  language: z.enum(['ar', 'en']).default('ar'),
});

export const updateTemplateSchema = createTemplateSchema.partial();
export const renderTemplateSchema = z.object({ context: z.record(z.unknown()).default({}) });

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
