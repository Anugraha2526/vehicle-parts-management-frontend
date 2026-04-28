import "./Select.css";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="select-group">
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="select-required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`select-field${error ? " select-field--error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
