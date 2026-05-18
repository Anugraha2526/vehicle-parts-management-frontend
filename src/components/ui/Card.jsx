export default function Card({ children, className = "" }) {
  return <section className={`cs-card ${className}`.trim()}>{children}</section>;
}
