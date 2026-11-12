import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, error, hint, endAdornment, id, style, ...rest }, ref) {
  const inputId = id ?? `in-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>{label}</label>}
      <div className="relative">
        <input ref={ref} id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-err` : undefined} style={{ width: '100%', padding: '10px 14px', fontSize: 15, border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: '#fff', color: 'var(--fg)', paddingInlineEnd: endAdornment ? 40 : 14, ...style }} {...rest} />
        {endAdornment && <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)' }}>{endAdornment}</span>}
      </div>
      {error && <p id={`${inputId}-err`} className="text-sm text-danger mt-2">{error}</p>}
      {!error && hint && <p className="text-sm text-muted mt-2">{hint}</p>}
    </div>
  );
});
