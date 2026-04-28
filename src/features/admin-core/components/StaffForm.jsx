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
  role: "",
  isActive: true,
};

function validate(fields, isEditMode) {
  const errors = {};

  if (!fields.fullName.trim() || fields.fullName.trim().length < 2) {
    errors.fullName = "Full name is required (minimum 2 characters).";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fields.email.trim() || !emailPattern.test(fields.email)) {
    errors.email = "A valid email address is required.";
  }

  if (!isEditMode && !fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password && fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!fields.role) {
    errors.role = "Role is required.";
  }

  return errors;
}

export default function StaffForm({ initialData, onSubmit, onCancel, loading }) {
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
      role: Number(fields.role),
      isActive: fields.isActive,
    };
    if (fields.password) {
      payload.password = fields.password;
    }

    onSubmit(payload);
  }

  return (
    <form className="staff-form" onSubmit={handleSubmit} noValidate>
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
        {/* password field is optional on edit mode */}
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
        <Select
          label="Role"
          name="role"
          value={fields.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          error={errors.role}
          required
        />
        {/* only show active toggle when editing an existing staff member */}
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
