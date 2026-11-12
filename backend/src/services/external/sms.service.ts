import { settingsService } from '../settings.service';
import { logger } from '../../utils/logger';

export interface SmsResult { ok: boolean; mock: boolean; sid?: string; error?: string; }

class SmsServiceImpl {
  private isMock = true;
  private sid = '';
  private token = '';
  private from = '';
  private loaded = false;

  private async load() {
    if (this.loaded) return;
    const cfg = await settingsService.getManyInternal(['sms.twilioSid', 'sms.twilioToken', 'sms.from']);
    this.sid = cfg['sms.twilioSid'] ?? '';
    this.token = cfg['sms.twilioToken'] ?? '';
    this.from = cfg['sms.from'] ?? '';
    this.isMock = !this.sid || !this.token;
    if (this.isMock) logger.warn('SmsService: Mock mode');
    this.loaded = true;
  }

  async reload() { this.loaded = false; await this.load(); }

  async testConnection(): Promise<{ ok: boolean; message: string; mock: boolean }> {
    await this.load();
    if (this.isMock) return { ok: true, message: 'Mock mode (Twilio غير مُعد)', mock: true };
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}.json`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${this.sid}:${this.token}`).toString('base64') },
      });
      return { ok: res.ok, message: res.ok ? 'Twilio متصل' : 'فشل التحقق', mock: false };
    } catch (e) { return { ok: false, message: (e as Error).message, mock: false }; }
  }

  async send(to: string, body: string, attempt = 1): Promise<SmsResult> {
    await this.load();
    if (this.isMock) {
      logger.info({ to, body: body.slice(0, 20) + '...', mock: true }, 'SmsService: Mock send');
      return { ok: true, mock: true };
    }
    try {
      const form = new URLSearchParams({ To: to, From: this.from, Body: body });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${this.sid}:${this.token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
      });
      const data = await res.json() as { sid?: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? 'Twilio error');
      return { ok: true, mock: false, sid: data.sid };
    } catch (e) {
      const msg = (e as Error).message;
      logger.error({ to, attempt, msg }, 'SmsService: send failed');
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return this.send(to, body, attempt + 1);
      }
      return { ok: false, mock: false, error: msg };
    }
  }
}

export const smsService = new SmsServiceImpl();
