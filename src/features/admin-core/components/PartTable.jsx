import { useCallback, useMemo } from "react";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import "./PartTable.css";

export default function PartTable({ parts, onEdit, onDelete, loading }) {
  // confirm before deleting to prevent accidental data loss
  const handleDeleteClick = useCallback(
    (part) => {
      if (
        window.confirm(
          `Delete "${part.partName}"? This action cannot be undone.`
        )
      ) {
        onDelete(part.id);
      }
    },
    [onDelete]
  );

  // memoized so re-renders from the parent don't recreate the array on every paint
  const columns = useMemo(
    () => [
      {
        key: "partName",
        label: "PART NAME",
      },
      {
        // monospace font so part numbers align and scan quickly
        key: "partNumber",
        label: "PART NUMBER",
        render: (value) => (
          <span className="part-table-part-number">{value}</span>
        ),
      },
      {
        key: "category",
        label: "CATEGORY",
      },
      {
        key: "vendorName",
        label: "VENDOR",
        render: (value) => value || <span className="part-table-empty">—</span>,
      },
      {
        key: "unitCost",
        label: "UNIT COST",
        render: (value) => `NPR ${Number(value).toFixed(2)}`,
      },
      {
        key: "sellingPrice",
        label: "SELLING PRICE",
        render: (value) => `NPR ${Number(value).toFixed(2)}`,
      },
      {
        key: "quantityInStock",
        label: "STOCK",
        render: (value, row) => (
          <div className="part-table-stock">
            <span className={row.isLowStock ? "part-table-stock--low" : undefined}>
              {value}
            </span>
            {row.isLowStock && (
              // raw span used here because Badge component hardcodes its label text
              <span className="badge badge--inactive">
                <span className="badge-dot" aria-hidden="true" />Low
              </span>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        label: "ACTIONS",
        render: (_, row) => (
          <div className="part-table-actions">
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
      data={parts}
      loading={loading}
      emptyMessage="No parts found."
    />
  );
}
