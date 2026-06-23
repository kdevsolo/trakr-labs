import * as z from 'zod';

import { PaginationMetaSchema, type PaginationMeta } from './api-response';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(8),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};
