import { settingsService } from '../settings.service';
import { logger } from '../../utils/logger';

const SANDBOX = 'https://api-m.sandbox.paypal.com';
const LIVE = 'https://api-m.paypal.com';

class PayPalServiceImpl {
  private isMock = true;
  private clientId = '';
  private secret = '';
  private mode: 'sandbox' | 'live' = 'sandbox';
  private baseUrl = SANDBOX;
  private loaded = false;

  private async load() {
    if (this.loaded) return;
    const cfg = await settingsService.getManyInternal(['paypal.clientId', 'paypal.secret', 'paypal.mode']);
    this.clientId = cfg['paypal.clientId'] ?? '';
    this.secret = cfg['paypal.secret'] ?? '';
    this.mode = (cfg['paypal.mode'] as 'sandbox' | 'live') ?? 'sandbox';
    this.baseUrl = this.mode === 'live' ? LIVE : SANDBOX;
    this.isMock = !this.clientId || !this.secret;
    if (this.isMock) logger.warn('PayPalService: Mock mode');
    this.loaded = true;
  }

  async reload() { this.loaded = false; await this.load(); }

  private async getAccessToken(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.clientId}:${this.secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error('PayPal auth failed');
    const data = await res.json() as { access_token: string };
    return data.access_token;
  }

  async testConnection(): Promise<{ ok: boolean; message: string; mock: boolean }> {
    await this.load();
    if (this.isMock) return { ok: true, message: 'Mock mode (PayPal غير مُعد)', mock: true };
    try { await this.getAccessToken(); return { ok: true, message: `PayPal ${this.mode} متصل`, mock: false }; }
    catch (e) { return { ok: false, message: (e as Error).message, mock: false }; }
  }

  async createOrder(amount: number, currency = 'USD'): Promise<{ id: string; approveUrl: string }> {
    await this.load();
    if (this.isMock) { const id = 'MOCK-' + Date.now(); return { id, approveUrl: `${this.baseUrl}/mock/checkoutnow?token=${id}` }; }
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) } }],
        application_context: { return_url: `${process.env.FRONTEND_URL}/payment/success`, cancel_url: `${process.env.FRONTEND_URL}/payment/cancel` },
      }),
    });
    const data = await res.json() as { id: string; links: Array<{ rel: string; href: string }> };
    if (!res.ok) throw new Error('PayPal createOrder failed');
    const approve = data.links.find(l => l.rel === 'approve')?.href ?? '';
    return { id: data.id, approveUrl: approve };
  }

  async captureOrder(orderId: string): Promise<{ status: string; id: string }> {
    await this.load();
    if (this.isMock) return { status: 'COMPLETED', id: orderId };
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json() as { status: string; id: string };
    if (!res.ok) throw new Error('PayPal captureOrder failed');
    return data;
  }

  async verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<boolean> {
    await this.load();
    if (this.isMock) return true;
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'], cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'], transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'], webhook_id: headers['paypal-webhook-id'],
          webhook_event: JSON.parse(rawBody),
        }),
      });
      const data = await res.json() as { verification_status: string };
      return data.verification_status === 'SUCCESS';
    } catch { return false; }
  }
}

export const paypalService = new PayPalServiceImpl();
