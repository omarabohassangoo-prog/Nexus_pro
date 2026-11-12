import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { installApi, type RequirementCheck } from '../../api/install.api';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const STEPS = ['ترحيب', 'المتطلبات', 'الإعدادات', 'المدير', 'التنفيذ', 'النجاح'];

export function InstallPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<RequirementCheck[]>([]);
  const [allOk, setAllOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('NEXUS');
  const [siteUrl, setSiteUrl] = useState(window.location.origin);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Array<{ name: string; ok: boolean; message?: string }>>([]);

  useEffect(() => {
    installApi.requirements()
      .then(r => { setChecks(r.checks); setAllOk(r.ok); })
      .catch(e => setError(extractError(e).message))
      .finally(() => setLoading(false));
  }, []);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await installApi.run({ adminName, adminEmail, adminPassword, siteName, siteUrl });
      setSteps(res.steps);
      setStep(5);
    } catch (e) { setError(extractError(e).message); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="p-6 flex justify-center"><Spinner size={48} /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="text-3xl font-bold mb-2 text-center">تنصيب NEXUS</h1>
        <p className="text-muted text-center mb-6">الخطوة {step + 1} من {STEPS.length}: {STEPS[step]}</p>
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, background: i <= step ? 'var(--primary)' : 'var(--border)', borderRadius: 2 }} />
          ))}
        </div>
        <div className="bg-white p-6 rounded shadow">
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

          {step === 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">مرحباً بك في NEXUS</h2>
              <p className="text-muted mb-4">معالج التنصيب سيرشدك خلال 6 خطوات لإعداد المنصة.</p>
              <Button onClick={() => setStep(1)}>ابدأ</Button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-4">فحص المتطلبات</h2>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {checks.map(c => (
                  <div key={c.key} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{c.ok ? '✅' : '❌'} {c.label}</span>
                    <span className="text-sm text-muted">{c.current} / {c.required}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(0)}>السابق</Button>
                <Button disabled={!allOk} onClick={() => setStep(2)}>التالي</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-4">إعدادات الموقع</h2>
              <div className="flex flex-col gap-4">
                <Input label="اسم الموقع" value={siteName} onChange={e => setSiteName(e.target.value)} />
                <Input label="رابط الموقع" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(1)}>السابق</Button>
                <Button onClick={() => setStep(3)}>التالي</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mb-4">حساب المدير</h2>
              <div className="flex flex-col gap-4">
                <Input label="الاسم" value={adminName} onChange={e => setAdminName(e.target.value)} />
                <Input label="البريد" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                <Input label="كلمة المرور" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>السابق</Button>
                <Button disabled={!adminName || !adminEmail || adminPassword.length < 8} onClick={() => setStep(4)}>التالي</Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-bold mb-4">التنفيذ</h2>
              <p className="text-muted mb-4">سيتم تشغيل migrations + seed + إنشاء المدير.</p>
              {steps.length > 0 && (
                <div className="mb-4">
                  {steps.map(s => (
                    <div key={s.name}>{s.ok ? '✅' : '❌'} {s.name} {s.message && <span className="text-danger">— {s.message}</span>}</div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} disabled={running}>السابق</Button>
                <Button onClick={run} loading={running}>بدء التنصيب</Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-bold mb-4 text-success">🎉 تم التنصيب بنجاح</h2>
              <p className="text-muted mb-4">يمكنك الآن تسجيل الدخول.</p>
              <Button onClick={() => nav('/login')}>الدخول</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
