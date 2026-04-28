export default function Table({ children, className = "" }) {
  return <table className={`cs-table ${className}`.trim()}>{children}</table>;
}
