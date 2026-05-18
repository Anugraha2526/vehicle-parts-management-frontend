import { useState, useEffect } from "react";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";
import "./PartForm.css";

const EMPTY_FIELDS = {
  partName: "",
  partNumber: "",
  category: "",
  vendorId: "",
  quantityPurchased: "",
  unitCost: "",
  sellingPrice: "",
  description: "",
};

// returns an error map; an empty object means all fields are valid
function validate(fields, isEditMode) {
  const errors = {};

  if (!fields.partName.trim() || fields.partName.trim().length < 2) {
    errors.partName = "Part name is required.";
  }

  if (!fields.partNumber.trim()) {
    errors.partNumber = "Part number is required.";
  }

  if (!fields.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!fields.vendorId) {
    errors.vendorId = "Vendor is required.";
  }

  if (!isEditMode) {
    if (fields.quantityPurchased === "" || Number(fields.quantityPurchased) < 0) {
      errors.quantityPurchased = "Initial stock must be 0 or more.";
    }
  } else if (fields.quantityPurchased !== "" && Number(fields.quantityPurchased) < 0) {
    errors.quantityPurchased = "Quantity to add must be 0 or more.";
  }

  if (fields.unitCost === "" || Number(fields.unitCost) <= 0) {
    errors.unitCost = "Unit cost must be greater than 0.";
  }

  if (fields.sellingPrice === "" || Number(fields.sellingPrice) <= 0) {
    errors.sellingPrice = "Selling price must be greater than 0.";
  }

  return errors;
}

export default function PartForm({ initialData, vendors, onSubmit, onCancel, loading, submitError }) {
  const isEditMode = Boolean(initialData);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});

  // reset form fields when initialData prop changes
  useEffect(() => {
    if (initialData) {
      setFields({
        partName: initialData.partName ?? "",
        partNumber: initialData.partNumber ?? "",
        category: initialData.category ?? "",
        vendorId: initialData.vendorId ?? "",
        // quantity field represents additional stock to add, not the current total
        quantityPurchased: "",
        unitCost: String(initialData.unitCost ?? ""),
        sellingPrice: String(initialData.sellingPrice ?? ""),
        description: initialData.description ?? "",
      });
    } else {
      setFields(EMPTY_FIELDS);
    }
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(fields, isEditMode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      partName: fields.partName.trim(),
      partNumber: fields.partNumber.trim(),
      category: fields.category.trim(),
      vendorId: fields.vendorId,
      unitCost: Number(fields.unitCost),
      sellingPrice: Number(fields.sellingPrice),
      description: fields.description.trim() || null,
    };

    // only include quantityPurchased when provided (create always requires it; edit is optional)
    if (!isEditMode || fields.quantityPurchased !== "") {
      payload.quantityPurchased = Number(fields.quantityPurchased);
    }

    onSubmit(payload);
  }

  // shape vendor list into value/label pairs the Select component expects
  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.vendorName }));

  return (
    <form className="part-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="form-submit-error" role="alert">
          {submitError}
        </div>
      )}
      <div className="part-form-fields">
        <Input
          label="Part Name"
          name="partName"
          value={fields.partName}
          onChange={handleChange}
          error={errors.partName}
          placeholder="e.g. Brake Pad Set"
          required
        />
        {/* part number uses JetBrains Mono for quick scanning */}
        <div className="input-group">
          <label htmlFor="partNumber" className="input-label">
            Part Number
            <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="partNumber"
            name="partNumber"
            value={fields.partNumber}
            onChange={handleChange}
            maxLength={50}
            placeholder="e.g. BP-2024-001"
            className={`input-field part-form-part-number${errors.partNumber ? " input-field--error" : ""}`}
            aria-invalid={Boolean(errors.partNumber)}
            aria-describedby={errors.partNumber ? "partNumber-error" : undefined}
          />
          {errors.partNumber && (
            <span id="partNumber-error" className="input-error" role="alert">
              {errors.partNumber}
            </span>
          )}
        </div>
        <Input
          label="Category"
          name="category"
          value={fields.category}
          onChange={handleChange}
          error={errors.category}
          placeholder="e.g. Brakes"
          required
        />
        <Select
          label="Vendor"
          name="vendorId"
          value={fields.vendorId}
          onChange={handleChange}
          options={vendorOptions}
          error={errors.vendorId}
          required
        />
        {/* label and placeholder differ between create and edit to reflect what the field means */}
        <div className="input-group">
          <label htmlFor="quantityPurchased" className="input-label">
            {isEditMode ? "Quantity to Add" : "Initial Stock"}
            {!isEditMode && <span className="input-required" aria-hidden="true">*</span>}
          </label>
          <input
            id="quantityPurchased"
            name="quantityPurchased"
            type="number"
            value={fields.quantityPurchased}
            onChange={handleChange}
            min={0}
            step={1}
            placeholder={isEditMode ? "Leave blank to keep current stock" : "e.g. 50"}
            className={`input-field${errors.quantityPurchased ? " input-field--error" : ""}`}
            aria-invalid={Boolean(errors.quantityPurchased)}
            aria-describedby={errors.quantityPurchased ? "quantityPurchased-error" : undefined}
          />
          {errors.quantityPurchased && (
            <span id="quantityPurchased-error" className="input-error" role="alert">
              {errors.quantityPurchased}
            </span>
          )}
        </div>
        <div className="input-group">
          <label htmlFor="unitCost" className="input-label">
            Unit Cost (NPR)
            <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="unitCost"
            name="unitCost"
            type="number"
            value={fields.unitCost}
            onChange={handleChange}
            min={0}
            step="0.01"
            placeholder="e.g. 500.00"
            className={`input-field${errors.unitCost ? " input-field--error" : ""}`}
            aria-invalid={Boolean(errors.unitCost)}
            aria-describedby={errors.unitCost ? "unitCost-error" : undefined}
          />
          {errors.unitCost && (
            <span id="unitCost-error" className="input-error" role="alert">
              {errors.unitCost}
            </span>
          )}
        </div>
        <div className="input-group">
          <label htmlFor="sellingPrice" className="input-label">
            Selling Price (NPR)
            <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            value={fields.sellingPrice}
            onChange={handleChange}
            min={0}
            step="0.01"
            placeholder="e.g. 750.00"
            className={`input-field${errors.sellingPrice ? " input-field--error" : ""}`}
            aria-invalid={Boolean(errors.sellingPrice)}
            aria-describedby={errors.sellingPrice ? "sellingPrice-error" : undefined}
          />
          {errors.sellingPrice && (
            <span id="sellingPrice-error" className="input-error" role="alert">
              {errors.sellingPrice}
            </span>
          )}
        </div>
        {/* description uses textarea to allow longer text */}
        <div className="input-group">
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={fields.description}
            onChange={handleChange}
            className="input-field part-form-textarea"
            rows={3}
            maxLength={500}
            placeholder="Optional description of this part"
          />
        </div>
      </div>

      <div className="part-form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {isEditMode ? "Save Changes" : "Add Part"}
        </Button>
      </div>
    </form>
  );
}
