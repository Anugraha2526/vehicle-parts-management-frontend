export default function Badge({ children, variant = "info", className = "" }) {
  const nextClassName = `status-badge status-badge--${variant} ${className}`.trim();
  return <span className={nextClassName}>{children}</span>;
}
