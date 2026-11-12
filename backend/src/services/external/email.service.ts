import nodemailer, { Transporter } from 'nodemailer';
import { settingsService } from '../settings.service';
import { logger } from '../../utils/logger';

export interface EmailResult { ok: boolean; mock: boolean; messageId?: string; error?: string; }

class EmailServiceImpl {
  private transporter: Transporter | null = null;
  private isMock = true;
  private from = 'noreply@nexus.local';
  private loaded = false;

  private async load() {
    if (this.loaded) return;
    const cfg = await settingsService.getManyInternal(['email.host', 'email.port', 'email.user', 'email.pass', 'email.from', 'email.secure']);
    this.from = cfg['email.from'] || 'noreply@nexus.local';
    if (!cfg['email.host'] || !cfg['email.user'] || !cfg['email.pass']) {
      this.isMock = true;
      logger.warn('EmailService: Mock mode (config missing)');
    } else {
      this.transporter = nodemailer.createTransport({
        host: cfg['email.host'],
        port: Number(cfg['email.port'] ?? 587),
        secure: cfg['email.secure'] === 'true',
        auth: { user: cfg['email.user'], pass: cfg['email.pass'] },
      });
      this.isMock = false;
    }
    this.loaded = true;
  }

  async reload() {
    this.loaded = false;
    this.transporter = null;
    this.isMock = true;
    await this.load();
  }

  async testConnection(): Promise<{ ok: boolean; message: string; mock: boolean }> {
    await this.load();
    if (this.isMock) return { ok: true, message: 'Mock mode (SMTP غير مُعد)', mock: true };
    try {
      await this.transporter!.verify();
      return { ok: true, message: 'SMTP متصل', mock: false };
    } catch (e) { return { ok: false, message: (e as Error).message, mock: false }; }
  }

  async send(to: string, subject: string, html: string, attempt = 1): Promise<EmailResult> {
    await this.load();
    if (this.isMock) {
      logger.info({ to, subject, mock: true }, 'EmailService: Mock send');
      return { ok: true, mock: true };
    }
    try {
      const info = await this.transporter!.sendMail({ from: this.from, to, subject, html });
      return { ok: true, mock: false, messageId: info.messageId };
    } catch (e) {
      const msg = (e as Error).message;
      logger.error({ to, attempt, msg }, 'EmailService: send failed');
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return this.send(to, subject, html, attempt + 1);
      }
      return { ok: false, mock: false, error: msg };
    }
  }

  async sendTemplate(key: string, to: string, context: Record<string, unknown>, opts?: { userId?: number; language?: string }): Promise<EmailResult> {
    const { templateService } = await import('../template.service');
    const { subject, body } = await templateService.render(key, context, {
      userId: opts?.userId, language: opts?.language, channel: 'email',
    });
    return this.send(to, subject || 'NEXUS', body);
  }
}

export const emailService = new EmailServiceImpl();
