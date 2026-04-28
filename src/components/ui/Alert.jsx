export default function Alert({ children, variant = "info" }) {
  return <div className={`cs-alert cs-alert--${variant}`}>{children}</div>;
}
