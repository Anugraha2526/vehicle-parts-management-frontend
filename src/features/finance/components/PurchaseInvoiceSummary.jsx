import Button from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function PurchaseInvoiceSummary({
  lineCount,
  totalUnits,
  totalAmount,
  isSubmitting,
}) {
  return (
    <section className="cs-card">
      <h3>Invoice Summary</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Line Items</span>
          <strong className="summary-value">{lineCount}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Units</span>
          <strong className="summary-value">{totalUnits}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Estimated Total</span>
          <strong className="summary-value summary-value--money">
            {formatCurrency(totalAmount, "NPR", "en-NP")}
          </strong>
        </div>
      </div>
      <Button
        type="submit"
        form="purchase-invoice-form"
        variant="primary"
        className="summary-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Create Invoice"}
      </Button>
    </section>
  );
}
