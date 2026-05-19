import { useCallback, useMemo } from "react";
import Table from "../../../components/common/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/common/Button";
import { formatDate } from "../../../utils/formatDate";
import "./StaffTable.css";

const ROLE_BADGE = { Admin: "admin", Staff: "staff", Customer: "customer" };

export default function StaffTable({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}) {
  // show confirm dialog before deleting to prevent accidents
  const handleDeleteClick = useCallback(
    (member) => {
      if (
        window.confirm(
          `Delete "${member.fullName}"? This action cannot be undone.`
        )
      ) {
        onDelete(member.id);
      }
    },
    [onDelete]
  );

  const columns = useMemo(
    () => [
      {
        key: "fullName",
        label: "Full Name",
      },
      {
        key: "email",
        label: "Email",
        render: (value) => (
          <span className="staff-table-email">{value}</span>
        ),
      },
      {
        key: "role",
        label: "Role",
        render: (value) => (
          <Badge variant={ROLE_BADGE[value] ?? "staff"} />
        ),
      },
      {
        key: "isActive",
        label: "Status",
        render: (value) => (
          <Badge variant={value ? "active" : "inactive"} />
        ),
      },
      {
        key: "createdAtUtc",
        label: "Created",
        render: (value) => (
          <span className="staff-table-date">{formatDate(value)}</span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <div className="staff-table-actions">
            <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleStatus(row.id)}
            >
              {row.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(row)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onToggleStatus, handleDeleteClick]
  );

  return (
    <Table
      columns={columns}
      data={staff}
      loading={loading}
      emptyMessage="No staff members found."
    />
  );
}
