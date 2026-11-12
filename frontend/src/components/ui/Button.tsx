import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
  secondary: { background: 'var(--secondary)', color: '#fff', border: '1px solid var(--secondary)' },
  danger: { background: 'var(--danger)', color: '#fff', border: '1px solid var(--danger)' },
  ghost: { background: 'transparent', color: 'var(--fg)', border: '1px solid transparent' },
  outline: { background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)' },
};

const sizes = {
  sm: { padding: '6px 12px', fontSize: 13 },
  md: { padding: '10px 18px', fontSize: 15 },
  lg: { padding: '14px 24px', fontSize: 16 },
};

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, style, ...rest }: Props) {
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button {...rest} disabled={disabled || loading} style={{ ...v, ...s, borderRadius: 'var(--radius)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, opacity: disabled || loading ? .6 : 1, transition: 'opacity .15s', ...style }}>
      {loading && <span aria-hidden>⏳</span>}
      {children}
    </button>
  );
}
