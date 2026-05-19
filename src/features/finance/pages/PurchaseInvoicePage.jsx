import Alert from "../../../components/ui/Alert";
import PageHeader from "../../../components/ui/PageHeader";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";
import PurchaseInvoiceForm from "../components/PurchaseInvoiceForm";
import PurchaseInvoiceItemsTable from "../components/PurchaseInvoiceItemsTable";
import PurchaseInvoiceSummary from "../components/PurchaseInvoiceSummary";
import { usePurchases } from "../hooks/usePurchases";

export default function PurchaseInvoicePage() {
  const {
    vendors,
    parts,
    vendorId,
    setVendorId,
    purchasedAtLocal,
    setPurchasedAtLocal,
    items,
    updateItem,
    addItem,
    removeItem,
    totals,
    isLoadingReferences,
    referencesError,
    referenceHint,
    formError,
    successMessage,
    createdInvoice,
    isSubmitting,
    submitInvoice,
    reloadReferences,
  } = usePurchases();

  return (
    <div className="finance-page">
      <PageHeader
        title="Purchase Invoices For Stock Updates"
        subtitle="Record vendor purchases and instantly update inventory quantities."
      />

      {referencesError ? <Alert variant="warning">{referencesError}</Alert> : null}
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {successMessage ? (
        <div className="ui-toast-layer" role="status" aria-live="polite">
          <Alert variant="success">{successMessage}</Alert>
        </div>
      ) : null}

      <div className="finance-grid finance-grid--invoice">
        <div className="finance-main">
          <PurchaseInvoiceForm
            vendorId={vendorId}
            purchasedAtLocal={purchasedAtLocal}
            vendors={vendors}
            onVendorChange={setVendorId}
            onPurchasedAtChange={setPurchasedAtLocal}
            onSubmit={submitInvoice}
            onReloadReferences={reloadReferences}
            isLoadingReferences={isLoadingReferences}
            isSubmitting={isSubmitting}
            referenceHint={referenceHint}
          />

          <PurchaseInvoiceItemsTable
            items={items}
            parts={parts}
            onItemChange={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        </div>

        <aside className="finance-side">
          <PurchaseInvoiceSummary
            lineCount={totals.lineCount}
            totalUnits={totals.totalUnits}
            totalAmount={totals.totalAmount}
            isSubmitting={isSubmitting}
          />

          {createdInvoice ? (
            <section className="cs-card">
              <h3>Latest Invoice Created</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Invoice Number</span>
                  <strong className="summary-value cs-mono">
                    {createdInvoice.invoiceNumber}
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Purchased Date</span>
                  <strong className="summary-value">
                    {formatDate(createdInvoice.purchasedAtUtc)}
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Items</span>
                  <strong className="summary-value">{createdInvoice.totalItems}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Amount</span>
                  <strong className="summary-value summary-value--money">
                    {formatCurrency(createdInvoice.totalAmount, "NPR", "en-NP")}
                  </strong>
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
