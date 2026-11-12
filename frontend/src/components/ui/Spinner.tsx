export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span aria-label="loading" style={{ display: 'inline-block', width: size, height: size, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
