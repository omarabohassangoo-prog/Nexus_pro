import { z } from 'zod';

export const settingGroupParamSchema = z.object({
  group: z.enum(['general', 'env', 'database', 'email', 'sms', 'whatsapp', 'paypal', 'files', 'css', 'i18n', 'cloud', 'secrets']),
});

export const updateSettingItemSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().max(10000),
});

export const updateSettingsGroupSchema = z.object({
  items: z.array(updateSettingItemSchema).min(1).max(100),
});

export type UpdateSettingsGroupInput = z.infer<typeof updateSettingsGroupSchema>;
