import { TemplateType } from '../constants/enums';
export interface RenderContext { [k: string]: unknown; }
export interface TemplateInput { key: string; name: string; type: TemplateType; subject?: string; body: string; variables?: string[]; language?: string; }
