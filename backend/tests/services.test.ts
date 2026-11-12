import { emailService } from '../src/services/external/email.service';
import { smsService } from '../src/services/external/sms.service';
import { whatsappService } from '../src/services/external/whatsapp.service';
import { paypalService } from '../src/services/external/paypal.service';

describe('External services (mock mode)', () => {
  it('email mock', async () => {
    const r = await emailService.testConnection();
    expect(r.ok).toBe(true);
  });

  it('sms mock', async () => {
    const r = await smsService.testConnection();
    expect(r.ok).toBe(true);
  });

  it('whatsapp mock', async () => {
    const r = await whatsappService.testConnection();
    expect(r.ok).toBe(true);
  });

  it('paypal mock createOrder', async () => {
    const order = await paypalService.createOrder(99.99, 'USD');
    expect(order.id).toMatch(/^MOCK-/);
  });
});
