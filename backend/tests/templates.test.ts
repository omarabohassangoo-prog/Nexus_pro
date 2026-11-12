import { templateService } from '../src/services/template.service';
import { prisma } from '../src/config/prisma';

describe('Templates', () => {
  it('renders system template', async () => {
    const t = await prisma.template.findFirst({ where: { key: 'welcome_user' } });
    expect(t).toBeTruthy();
    const r = await templateService.render('welcome_user', { name: 'Alice' }, { channel: 'email' });
    expect(r.body).toContain('Alice');
    expect(r.subject).toContain('Alice');
  });

  it('sanitizes script injection', async () => {
    const r = await templateService.render('welcome_user', { name: '<script>alert(1)</script>Bob' }, { channel: 'email' });
    expect(r.body).not.toContain('<script>');
  });
});
