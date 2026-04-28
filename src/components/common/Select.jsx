export default function Select({ options = [], className = "", ...props }) {
  const nextClassName = `cs-select ${className}`.trim();

  return (
    <select className={nextClassName} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
