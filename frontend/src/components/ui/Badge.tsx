interface Props { children: string; color?: 'default' | 'success' | 'danger' | 'warning' | 'info'; }
const colors = {
  default: { bg: '#e2e8f0', fg: '#0f172a' },
  success: { bg: '#d1fae5', fg: '#065f46' },
  danger: { bg: '#fee2e2', fg: '#991b1b' },
  warning: { bg: '#fef3c7', fg: '#92400e' },
  info: { bg: '#dbeafe', fg: '#1e40af' },
};
export function Badge({ children, color = 'default' }: Props) {
  const c = colors[color];
  return <span style={{ background: c.bg, color: c.fg, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{children}</span>;
}
