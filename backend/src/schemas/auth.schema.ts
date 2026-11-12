import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور 8 أحرف على الأقل')
  .max(128, 'كلمة المرور طويلة جداً')
  .regex(/[a-z]/, 'يجب أن تحتوي حرفاً صغيراً')
  .regex(/[A-Z]/, 'يجب أن تحتوي حرفاً كبيراً')
  .regex(/[0-9]/, 'يجب أن تحتوي رقماً')
  .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي رمزاً');

const emailSchema = z.string().trim().toLowerCase().email('بريد غير صالح').max(255);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2, 'الاسم قصير جداً').max(100),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/).optional(),
  type: z.enum(['USER', 'EDITOR']).default('USER'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'يجب الموافقة على الشروط' }) }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  remember: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: z.string().min(10), password: passwordSchema });
export const activateSchema = z.object({ token: z.string().min(10) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });
export const refreshSchema = z.object({ refreshToken: z.string().min(10).optional() });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ActivateInput = z.infer<typeof activateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
