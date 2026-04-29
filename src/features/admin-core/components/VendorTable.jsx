import { useCallback, useMemo } from "react";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import "./VendorTable.css";

export default function VendorTable({ vendors, onEdit, onDelete, loading }) {
  // confirm before deleting to prevent accidental data loss
  const handleDeleteClick = useCallback(
    (vendor) => {
      if (
        window.confirm(
          `Delete "${vendor.vendorName}"? This action cannot be undone.`
        )
      ) {
        onDelete(vendor.id);
      }
    },
    [onDelete]
  );

  const columns = useMemo(
    () => [
      {
        key: "vendorName",
        label: "VENDOR NAME",
      },
      {
        key: "contactPerson",
        label: "CONTACT PERSON",
      },
      {
        key: "phone",
        label: "PHONE",
      },
      {
        key: "email",
        label: "EMAIL",
      },
      {
        key: "address",
        label: "ADDRESS",
        // show dash for empty address field
        render: (value) => value || <span className="vendor-table-empty">—</span>,
      },
      {
        key: "actions",
        label: "ACTIONS",
        render: (_, row) => (
          <div className="vendor-table-actions">
            <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
              Edit
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
    [onEdit, handleDeleteClick]
  );

  return (
    <Table
      columns={columns}
      data={vendors}
      loading={loading}
      emptyMessage="No vendors found."
    />
  );
}
