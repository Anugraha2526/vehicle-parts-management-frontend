import { useState, useEffect } from "react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import "./VendorForm.css";

const EMPTY_FIELDS = {
  vendorName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function validate(fields) {
  const errors = {};

  const vName = fields.vendorName.trim();
  if (!vName) {
    errors.vendorName = "Vendor name is required.";
  } else if (vName.length < 3) {
    errors.vendorName = "Vendor name must be at least 3 characters.";
  }

  const contactWords = fields.contactPerson.trim().split(/\s+/).filter(Boolean);
  if (contactWords.length < 2) {
    errors.contactPerson = "Enter the full name of the contact person (e.g. Rajan Thapa).";
  }

  const phoneDigits = fields.phone.replace(/[\s\-().+]/g, "");
  if (!phoneDigits) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d+$/.test(phoneDigits)) {
    errors.phone = "Phone number may only contain digits, spaces, hyphens, or a leading +.";
  } else if (phoneDigits.length !== 10) {
    errors.phone = "Phone number must be exactly 10 digits (e.g. 9841000000).";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fields.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailPattern.test(fields.email.trim())) {
    errors.email = "Enter a valid email address (e.g. contact@vendor.com).";
  }

  const addr = fields.address.trim();
  if (addr && addr.length < 5) {
    errors.address = "Address must be at least 5 characters if provided.";
  }

  return errors;
}

export default function VendorForm({ initialData, onSubmit, onCancel, loading, submitError }) {
  const isEditMode = Boolean(initialData);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});

  // reset form fields when initialData prop changes
  useEffect(() => {
    if (initialData) {
      setFields({
        vendorName: initialData.vendorName ?? "",
        contactPerson: initialData.contactPerson ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        address: initialData.address ?? "",
        notes: initialData.notes ?? "",
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
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      vendorName: fields.vendorName.trim(),
      contactPerson: fields.contactPerson.trim(),
      phone: fields.phone.trim(),
      email: fields.email.trim(),
      address: fields.address.trim(),
      notes: fields.notes.trim(),
    });
  }

  return (
    <form className="vendor-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="form-submit-error" role="alert">
          {submitError}
        </div>
      )}
      <div className="vendor-form-fields">
        <Input
          label="Vendor Name"
          name="vendorName"
          value={fields.vendorName}
          onChange={handleChange}
          error={errors.vendorName}
          placeholder="e.g. AutoParts Wholesale Ltd."
          required
          maxLength={200}
        />
        <Input
          label="Contact Person"
          name="contactPerson"
          value={fields.contactPerson}
          onChange={handleChange}
          error={errors.contactPerson}
          placeholder="e.g. Rajan Thapa"
          required
          maxLength={100}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={fields.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="e.g. 9841000000"
          required
          maxLength={20}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="e.g. contact@vendor.com"
          required
          maxLength={150}
        />
        <Input
          label="Address"
          name="address"
          value={fields.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="e.g. Kathmandu, Nepal"
          maxLength={500}
        />
        {/* notes field uses textarea to allow longer text */}
        <div className="input-group">
          <label htmlFor="notes" className="input-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={fields.notes}
            onChange={handleChange}
            className="input-field vendor-form-textarea"
            rows={3}
            maxLength={500}
            placeholder="Optional notes about this vendor"
          />
        </div>
      </div>

      <div className="vendor-form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {isEditMode ? "Save Changes" : "Add Vendor"}
        </Button>
      </div>
    </form>
  );
}
