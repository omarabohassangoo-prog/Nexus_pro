export interface SettingInput { key: string; value: string; group: string; isSecret?: boolean; }
export interface SettingOutput { key: string; value: string; group: string; isSecret: boolean; isEncrypted: boolean; updatedAt: Date; }
