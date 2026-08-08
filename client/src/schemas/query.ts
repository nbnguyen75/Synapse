import z from 'zod/v4';

import { m } from '@/paraglide/messages';

export const paginationQuerySchema = z.object({
  pageSize: z.coerce
    .number({ message: m.validation_page_size_invalid() })
    .int({ message: m.validation_page_size_invalid() })
    .positive({ message: m.validation_page_size_invalid() })
    .max(100, { message: m.validation_page_size_max() })
    .default(20),
  page: z.coerce
    .number({ message: m.validation_page_invalid() })
    .int({ message: m.validation_page_invalid() })
    .positive({ message: m.validation_page_invalid() })
    .default(1),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
