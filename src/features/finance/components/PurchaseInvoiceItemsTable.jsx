import Button from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function PurchaseInvoiceItemsTable({
  items,
  parts,
  onItemChange,
  onAddItem,
  onRemoveItem,
}) {
  const hasPartOptions = parts.length > 0;

  return (
    <section className="cs-card">
      <div className="card-heading">
        <h3>Invoice Items</h3>
        <Button type="button" variant="secondary" onClick={onAddItem}>
          + Add Item
        </Button>
      </div>

      <div className="cs-table-wrapper">
        <table className="cs-table cs-table--invoice-items">
          <colgroup>
            <col className="invoice-col-part" />
            <col className="invoice-col-qty" />
            <col className="invoice-col-unit" />
            <col className="invoice-col-total" />
            <col className="invoice-col-action" />
          </colgroup>
          <thead>
            <tr>
              <th>Part</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Line Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const lineTotal = Number(item.quantity || 0) * Number(item.unitCost || 0);

              return (
                <tr key={item.key}>
                  <td>
                    {hasPartOptions ? (
                      <select
                        className="cs-select"
                        value={item.partId}
                        onChange={(event) =>
                          onItemChange(item.key, "partId", event.target.value)
                        }
                      >
                        <option value="">Select part</option>
                        {parts.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.name}
                            {part.sku ? ` (${part.sku})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="cs-input cs-mono"
                        placeholder="Enter Part GUID"
                        value={item.partId}
                        onChange={(event) =>
                          onItemChange(item.key, "partId", event.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>
                    <input
                      className="cs-input"
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        onItemChange(item.key, "quantity", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cs-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(event) =>
                        onItemChange(item.key, "unitCost", event.target.value)
                      }
                    />
                  </td>
                  <td
                    className="cs-mono cs-line-total-cell"
                    title={formatCurrency(lineTotal, "NPR", "en-NP")}
                  >
                    {formatCurrency(lineTotal, "NPR", "en-NP")}
                  </td>
                  <td className="cs-action-cell">
                    <Button
                      type="button"
                      variant="ghost"
                      className="cs-action-remove-btn"
                      onClick={() => onRemoveItem(item.key)}
                      disabled={items.length === 1}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
