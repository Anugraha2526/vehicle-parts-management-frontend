import "./Badge.css";

const BADGE_CONFIG = {
  active:   { label: "Active",    className: "badge--active" },
  inactive: { label: "Inactive",  className: "badge--inactive" },
  admin:    { label: "Admin",     className: "badge--admin" },
  staff:    { label: "Staff",     className: "badge--staff" },
  customer: { label: "Customer",  className: "badge--customer" },
};

export default function Badge({ variant }) {
  const config = BADGE_CONFIG[variant] ?? { label: variant, className: "" };

  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
