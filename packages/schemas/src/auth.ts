import * as z from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SignUpSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    tncAccepted: z.boolean(),
  })
  .refine((data) => data.tncAccepted, {
    message: 'You must accept the Terms of Service and Privacy Policy.',
    path: ['tncAccepted'],
  });

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    tncAccepted: z.boolean(),
  })
  .refine((data) => data.tncAccepted, {
    message: 'You must accept the Terms of Service and Privacy Policy.',
    path: ['tncAccepted'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
