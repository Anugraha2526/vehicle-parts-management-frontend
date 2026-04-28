export default function Input({ className = "", ...props }) {
  const nextClassName = `cs-input ${className}`.trim();
  return <input className={nextClassName} {...props} />;
}
