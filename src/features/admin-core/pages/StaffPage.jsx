import { useState, useCallback } from "react";
import { useStaff } from "../hooks/useStaff";
import StaffTable from "../components/StaffTable";
import StaffForm from "../components/StaffForm";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import "./StaffPage.css";

export default function StaffPage() {
  const {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStatus,
  } = useStaff();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState(null);

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  // open modal in edit mode with selected staff data
  const handleEdit = useCallback((member) => {
    setSelectedStaff(member);
    setModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedStaff(null);
    setModalOpen(true);
  }, []);

  // close modal and reset selected staff
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedStaff(null);
    setFormError(null);
  }, []);

  async function handleFormSubmit(data) {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedStaff) {
        await updateStaff(selectedStaff.id, data);
        handleCloseModal();
        showNotification("success", "Staff member updated successfully.");
      } else {
        await createStaff(data);
        handleCloseModal();
        showNotification("success", "Staff member added successfully.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const serverMsg = typeof data === "string" && data.trim()
        ? data.trim()
        : (data?.errors ? Object.values(data.errors).flat()[0] : null)
          ?? data?.title
          ?? null;

      let message;
      if (status === 409 && serverMsg) {
        message = serverMsg;
      } else if (status === 400 && serverMsg) {
        message = `Invalid input: ${serverMsg}`;
      } else if (status === 500) {
        message = "A server error occurred. Please try again later.";
      } else {
        message = serverMsg ?? "Failed to save staff member. Please try again.";
      }
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteStaff(id);
      showNotification("success", "Staff member removed.");
    } catch {
      showNotification("error", "Failed to delete staff member. Please try again.");
    }
  }

  async function handleToggleStatus(id) {
    try {
      await toggleStatus(id);
      showNotification("success", "Staff status updated.");
    } catch {
      showNotification("error", "Failed to update staff status. Please try again.");
    }
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <h1 className="staff-page-title">Staff</h1>
          <p className="staff-page-subtitle">Manage staff accounts and roles</p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          + Add Staff
        </Button>
      </div>

      {notification && (
        <div
          className={`staff-page-notification staff-page-notification--${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {error && !notification && (
        <div
          className="staff-page-notification staff-page-notification--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <StaffTable
        staff={staff}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
      >
        <StaffForm
          initialData={selectedStaff}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          submitError={formError}
        />
      </Modal>
    </div>
  );
}
