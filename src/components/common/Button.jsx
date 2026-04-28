export default function Button({
  children,
  type = "button",
  variant = "secondary",
  className = "",
  ...props
}) {
  const nextClassName = `cs-button cs-button--${variant} ${className}`.trim();

  return (
    <button type={type} className={nextClassName} {...props}>
      {children}
    </button>
  );
}
