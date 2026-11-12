# Tests

## التشغيل
```bash
npm test              # كل الاختبارات
npm run test:watch    # وضع المراقبة
npm run test:coverage # مع التغطية
npm run test:ci       # CI mode
```

## البنية
- `setup.ts` — يهيئ DB اختباري + seed
- `auth.test.ts` — register/duplicate/login/401
- `auth.flows.test.ts` — activate/reset/loginHistory كامل
- `health.test.ts` + `health.deep.test.ts`
- `install.flow.test.ts` — status + requirements
- `rbac.test.ts` — admin vs user
- `templates.test.ts` — render + sanitize
- `services.test.ts` — email/sms/whatsapp/paypal mock

## التغطية
- التغطية الحالية: ~60% (line)
- الهدف: ≥70%
- أضف اختباراً لكل controller جديد
