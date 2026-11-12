import crypto from 'crypto';
import { settingsService } from '../settings.service';
import { logger } from '../../utils/logger';

export interface WaResult { ok: boolean; mock: boolean; messageId?: string; error?: string; }

class WhatsAppServiceImpl {
  private isMock = true;
  private token = '';
  private phoneId = '';
  private verifyToken = '';
  private loaded = false;

  private async load() {
    if (this.loaded) return;
    const cfg = await settingsService.getManyInternal(['whatsapp.token', 'whatsapp.phoneId', 'whatsapp.verifyToken']);
    this.token = cfg['whatsapp.token'] ?? '';
    this.phoneId = cfg['whatsapp.phoneId'] ?? '';
    this.verifyToken = cfg['whatsapp.verifyToken'] ?? '';
    this.isMock = !this.token || !this.phoneId;
    if (this.isMock) logger.warn('WhatsAppService: Mock mode');
    this.loaded = true;
  }

  async reload() { this.loaded = false; await this.load(); }

  async testConnection(): Promise<{ ok: boolean; message: string; mock: boolean }> {
    await this.load();
    if (this.isMock) return { ok: true, message: 'Mock mode (Meta غير مُعد)', mock: true };
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${this.phoneId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return { ok: res.ok, message: res.ok ? 'Meta متصل' : 'فشل التحقق', mock: false };
    } catch (e) { return { ok: false, message: (e as Error).message, mock: false }; }
  }

  async sendText(to: string, body: string): Promise<WaResult> {
    await this.load();
    if (this.isMock) {
      logger.info({ to, mock: true }, 'WhatsAppService: Mock send');
      return { ok: true, mock: true };
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${this.phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
      });
      const data = await res.json() as { messages?: Array<{ id: string }>; error?: { message: string } };
      if (!res.ok) throw new Error(data.error?.message ?? 'WhatsApp error');
      return { ok: true, mock: false, messageId: data.messages?.[0]?.id };
    } catch (e) {
      logger.error({ to, msg: (e as Error).message }, 'WhatsAppService: send failed');
      return { ok: false, mock: false, error: (e as Error).message };
    }
  }

  async verifySignature(rawBody: string, signature: string): Promise<boolean> {
    await this.load();
    if (!this.token) return false;
    const expected = crypto.createHmac('sha256', this.token).update(rawBody).digest('hex');
    const provided = signature.replace('sha256=', '');
    if (expected.length !== provided.length) return false;
    try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided)); }
    catch { return false; }
  }

  async verifyHandshake(mode: string, token: string, challenge: string): Promise<string | null> {
    await this.load();
    if (mode === 'subscribe' && token === this.verifyToken) return challenge;
    return null;
  }
}

export const whatsappService = new WhatsAppServiceImpl();
