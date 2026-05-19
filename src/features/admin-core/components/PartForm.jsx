import { useState, useEffect, useRef } from "react";
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

  const pName = fields.partName.trim();
  if (!pName || pName.length < 3) {
    errors.partName = "Part name must be at least 3 characters (e.g. Brake Pad Set).";
  }

  const pNum = fields.partNumber.trim();
  if (!pNum) {
    errors.partNumber = "Part number is required.";
  } else if (pNum.length < 3) {
    errors.partNumber = "Part number must be at least 3 characters.";
  } else if (!/^[A-Za-z0-9][A-Za-z0-9\-_./ ]*$/.test(pNum)) {
    errors.partNumber = "Part number may only contain letters, digits, hyphens, dots, or slashes.";
  }

  if (!fields.category.trim() || fields.category.trim().length < 2) {
    errors.category = "Category is required (e.g. Brakes, Engine, Filters).";
  }

  if (!fields.vendorId) {
    errors.vendorId = "Please select a vendor.";
  }

  if (!isEditMode) {
    if (fields.quantityPurchased === "" || Number(fields.quantityPurchased) < 0) {
      errors.quantityPurchased = "Initial stock must be 0 or more.";
    }
  } else if (fields.quantityPurchased !== "") {
    const qty = Number(fields.quantityPurchased);
    if (qty === 0) {
      errors.quantityPurchased = "Enter a non-zero value (positive to add stock, negative to remove).";
    } else if (qty < 0 && Math.abs(qty) > (fields._currentStock ?? Infinity)) {
      errors.quantityPurchased = `Cannot remove ${Math.abs(qty)} units — only ${fields._currentStock} currently in stock.`;
    }
  }

  const unitCost = Number(fields.unitCost);
  if (fields.unitCost === "" || unitCost <= 0) {
    errors.unitCost = "Unit cost must be greater than 0.";
  }

  const sellingPrice = Number(fields.sellingPrice);
  if (fields.sellingPrice === "" || sellingPrice <= 0) {
    errors.sellingPrice = "Selling price must be greater than 0.";
  } else if (!errors.unitCost && unitCost > 0 && sellingPrice < unitCost) {
    errors.sellingPrice = `Selling price (NPR ${sellingPrice.toLocaleString()}) cannot be less than the unit cost (NPR ${unitCost.toLocaleString()}).`;
  }

  return errors;
}

export default function PartForm({ initialData, vendors, onSubmit, onCancel, loading, submitError }) {
  const isEditMode = Boolean(initialData);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});
  const errorRef = useRef(null);

  // scroll error banner into view whenever a new submit error arrives
  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError]);

  // reset form fields when initialData prop changes
  useEffect(() => {
    if (initialData) {
      setFields({
        partName: initialData.partName ?? "",
        partNumber: initialData.partNumber ?? "",
        category: initialData.category ?? "",
        vendorId: initialData.vendorId ?? "",
        quantityPurchased: "",
        _currentStock: initialData.quantityInStock ?? 0,
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
        <div className="form-submit-error" role="alert" ref={errorRef}>
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
        <div className="input-group">
          <label htmlFor="quantityPurchased" className="input-label">
            {isEditMode ? "Manage Qty" : "Initial Stock"}
            {!isEditMode && <span className="input-required" aria-hidden="true">*</span>}
          </label>
          <input
            id="quantityPurchased"
            name="quantityPurchased"
            type="number"
            value={fields.quantityPurchased}
            onChange={handleChange}
            min={isEditMode ? undefined : 0}
            step={1}
            placeholder={isEditMode ? "Positive to add stock, negative to remove" : "e.g. 50"}
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
