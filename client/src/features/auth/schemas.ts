import z from 'zod/v4';

import { m } from '@/paraglide/messages';

export const loginSchema = z.object({
  password: z
    .string()
    .min(1, m.validation_password_required())
    .min(6, m.validation_password_min()),
  email: z.email(m.validation_email_invalid()),
});

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    password: z
      .string()
      .min(1, m.validation_password_required())
      .min(6, m.validation_password_min()),
    confirmPassword: z.string().min(1, m.validation_confirm_required()),
    email: z.email(m.validation_email_invalid()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m.validation_password_mismatch(),
    path: ['confirmPassword'],
  });

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
