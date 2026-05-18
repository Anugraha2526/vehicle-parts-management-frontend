import { useState, useCallback } from "react";
import { useVendor } from "../hooks/useVendor";
import VendorTable from "../components/VendorTable";
import VendorForm from "../components/VendorForm";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import "./VendorPage.css";

export default function VendorPage() {
  const {
    vendors,
    loading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
  } = useVendor();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState(null);

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  // open modal in add mode with no pre-filled data
  const handleAddNew = useCallback(() => {
    setSelectedVendor(null);
    setModalOpen(true);
  }, []);

  // open modal in edit mode with vendor data pre-filled
  const handleEdit = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedVendor(null);
    setFormError(null);
  }, []);

  async function handleFormSubmit(data) {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedVendor) {
        await updateVendor(selectedVendor.id, data);
      } else {
        await createVendor(data);
      }
      handleCloseModal();
      showNotification("success", "Vendor saved successfully.");
    } catch (err) {
      const message =
        err?.response?.status === 409
          ? "A vendor with this email already exists."
          : "Failed to save vendor. Please check your inputs.";
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteVendor(id);
      showNotification("success", "Vendor deleted.");
    } catch {
      showNotification("error", "Failed to delete vendor. Please try again.");
    }
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page-header">
        <div>
          <h1 className="vendor-page-title">Vendors</h1>
          <p className="vendor-page-subtitle">
            Manage your supplier and vendor information
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          + Add Vendor
        </Button>
      </div>

      {notification && (
        <div
          className={`vendor-page-notification vendor-page-notification--${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {error && !notification && (
        <div
          className="vendor-page-notification vendor-page-notification--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <VendorTable
        vendors={vendors}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={selectedVendor ? "Edit Vendor" : "Add Vendor"}
      >
        <VendorForm
          initialData={selectedVendor}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          submitError={formError}
        />
      </Modal>
    </div>
  );
}
