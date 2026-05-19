import { useState, useEffect } from "react";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";
import "./StaffForm.css";

const ROLE_OPTIONS = [
  { value: 1, label: "Admin" },
  { value: 2, label: "Staff" },
];

const EMPTY_FIELDS = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
  role: "",
  isActive: true,
};

function validate(fields, isEditMode) {
  const errors = {};

  const nameWords = fields.fullName.trim().split(/\s+/).filter(Boolean);
  if (nameWords.length < 2) {
    errors.fullName = "Full name must be at least two words (e.g. Aarav Sharma).";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fields.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailPattern.test(fields.email.trim())) {
    errors.email = "Enter a valid email address (e.g. aarav@chitospare.com).";
  }

  if (!isEditMode && !fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password) {
    if (fields.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!/[A-Z]/.test(fields.password)) {
      errors.password = "Password must include at least one uppercase letter (A–Z).";
    } else if (!/[a-z]/.test(fields.password)) {
      errors.password = "Password must include at least one lowercase letter (a–z).";
    } else if (!/[0-9]/.test(fields.password)) {
      errors.password = "Password must include at least one number (0–9).";
    } else if (!/[^A-Za-z0-9]/.test(fields.password)) {
      errors.password = "Password must include at least one special character (e.g. !@#$%).";
    }
  }

  if (fields.phoneNumber.trim()) {
    const digits = fields.phoneNumber.replace(/[\s\-().+]/g, "");
    if (!/^\d+$/.test(digits) || digits.length !== 10) {
      errors.phoneNumber = "Phone number must be exactly 10 digits (e.g. 9841000000).";
    }
  }

  if (fields.address.trim() && fields.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters if provided (e.g. Kathmandu, Nepal).";
  }

  // role is only required when editing (to allow promotion/demotion)
  if (isEditMode && !fields.role) {
    errors.role = "Please select a role for this staff member.";
  }

  return errors;
}

export default function StaffForm({ initialData, onSubmit, onCancel, loading, submitError }) {
  const isEditMode = Boolean(initialData);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});

  // reset form fields when initialData changes
  useEffect(() => {
    if (initialData) {
      setFields({
        fullName: initialData.fullName ?? "",
        email: initialData.email ?? "",
        password: "",
        phoneNumber: initialData.phoneNumber ?? "",
        address: initialData.address ?? "",
        role: initialData.role ?? "",
        isActive: initialData.isActive ?? true,
      });
    } else {
      setFields(EMPTY_FIELDS);
    }
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      fullName: fields.fullName.trim(),
      email: fields.email.trim(),
      phoneNumber: fields.phoneNumber.trim() || null,
      address: fields.address.trim() || null,
    };

    if (fields.password) payload.password = fields.password;
    if (isEditMode) {
      payload.role = Number(fields.role);
      payload.isActive = fields.isActive;
    }

    onSubmit(payload);
  }

  return (
    <form className="staff-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="form-submit-error" role="alert">
          {submitError}
        </div>
      )}
      <div className="staff-form-fields">
        <Input
          label="Full Name"
          name="fullName"
          value={fields.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="e.g. Aarav Sharma"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="e.g. aarav@chitospare.com"
          required
        />
        {/* password is optional on edit, required on add */}
        <Input
          label={isEditMode ? "New Password (optional)" : "Password"}
          name="password"
          type="password"
          value={fields.password}
          onChange={handleChange}
          error={errors.password}
          placeholder={isEditMode ? "Leave blank to keep current" : "Min. 8 characters"}
          required={!isEditMode}
        />
        <Input
          label="Phone Number (optional)"
          name="phoneNumber"
          type="tel"
          value={fields.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          placeholder="e.g. 9841000000"
          maxLength={20}
        />
        <Input
          label="Address (optional)"
          name="address"
          value={fields.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="e.g. Kathmandu, Nepal"
          maxLength={300}
        />
        {/* role selector only shown in edit mode for promoting or demoting staff */}
        {isEditMode && (
          <Select
            label="Role"
            name="role"
            value={fields.role}
            onChange={handleChange}
            options={ROLE_OPTIONS}
            error={errors.role}
            required
          />
        )}
        {/* active toggle only shown when editing an existing staff member */}
        {isEditMode && (
          <div className="staff-form-toggle">
            <label className="staff-form-toggle-label">
              <input
                type="checkbox"
                name="isActive"
                checked={fields.isActive}
                onChange={handleChange}
                className="staff-form-checkbox"
              />
              Active account
            </label>
          </div>
        )}
      </div>

      <div className="staff-form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {isEditMode ? "Save Changes" : "Add Staff Member"}
        </Button>
      </div>
    </form>
  );
}
