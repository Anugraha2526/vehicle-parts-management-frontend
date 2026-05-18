import Button from "../../../components/common/Button";

export default function PurchaseInvoiceForm({
  vendorId,
  purchasedAtLocal,
  vendors,
  onVendorChange,
  onPurchasedAtChange,
  onSubmit,
  onReloadReferences,
  isLoadingReferences,
  isSubmitting,
  referenceHint,
}) {
  const hasVendorOptions = vendors.length > 0;

  return (
    <section className="cs-card">
      <div className="card-heading">
        <h3>Create Purchase Invoice</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={onReloadReferences}
          disabled={isLoadingReferences}
        >
          {isLoadingReferences ? "Refreshing..." : "Refresh refs"}
        </Button>
      </div>

      <form id="purchase-invoice-form" className="cs-form" onSubmit={onSubmit}>
        <div className="cs-form-grid">
          <label className="cs-field">
            Vendor
            {hasVendorOptions ? (
              <select
                className="cs-select"
                value={vendorId}
                onChange={(event) => onVendorChange(event.target.value)}
                required
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                    {vendor.contactPerson ? ` - ${vendor.contactPerson}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="cs-input cs-mono"
                placeholder="Enter Vendor GUID"
                value={vendorId}
                onChange={(event) => onVendorChange(event.target.value)}
                required
              />
            )}
          </label>

          <label className="cs-field">
            Purchase Date/Time
            <input
              className="cs-input"
              type="datetime-local"
              value={purchasedAtLocal}
              onChange={(event) => onPurchasedAtChange(event.target.value)}
            />
          </label>
        </div>

        <p className="cs-helper">{referenceHint}</p>
      </form>
    </section>
  );
}
