import { useState, useCallback, useEffect } from "react";
import { useParts } from "../hooks/useParts";
import { vendorsForPartsApi } from "../../../api/vendorsForPartsApi";
import PartTable from "../components/PartTable";
import PartForm from "../components/PartForm";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import "./PartsPage.css";

export default function PartsPage() {
  const {
    parts,
    loading,
    error,
    createPart,
    updatePart,
    deletePart,
  } = useParts();

  // vendor list is fetched once for the part form dropdown
  const [vendors, setVendors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState(null);

  // load vendor list once so the form dropdown is ready when the modal opens
  useEffect(() => {
    vendorsForPartsApi.getAll()
      .then((res) => setVendors(res.data))
      .catch(() => {});
  }, []);

  function showNotification(type, message) {
    setNotification({ type, message });
    // auto-dismiss after 3 seconds so the banner doesn't linger
    setTimeout(() => setNotification(null), 3000);
  }

  // open modal in add mode with no pre-filled data
  const handleAddNew = useCallback(() => {
    setSelectedPart(null);
    setModalOpen(true);
  }, []);

  // open modal in edit mode with part data pre-filled
  const handleEdit = useCallback((part) => {
    setSelectedPart(part);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedPart(null);
    setFormError(null);
  }, []);

  // save the part then close the modal; surfaces 409 as a duplicate part-number message
  async function handleFormSubmit(data) {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedPart) {
        await updatePart(selectedPart.id, data);
      } else {
        await createPart(data);
      }
      handleCloseModal();
      showNotification("success", "Part saved successfully.");
    } catch (err) {
      const serverMsg = typeof err?.response?.data === "string" ? err.response.data : null;
      const message =
        err?.response?.status === 409 && serverMsg
          ? serverMsg
          : "Failed to save part. Please check your inputs.";
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  }

  // delete the part and show feedback regardless of outcome
  async function handleDelete(id) {
    try {
      await deletePart(id);
      showNotification("success", "Part deleted.");
    } catch {
      showNotification("error", "Failed to delete part. Please try again.");
    }
  }

  return (
    <div className="parts-page">
      <div className="parts-page-header">
        <div>
          <h1 className="parts-page-title">Parts</h1>
          <p className="parts-page-subtitle">
            Manage your vehicle parts inventory
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          + Add Part
        </Button>
      </div>

      {notification && (
        <div
          className={`parts-page-notification parts-page-notification--${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {error && !notification && (
        <div
          className="parts-page-notification parts-page-notification--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <PartTable
        parts={parts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={selectedPart ? "Edit Part" : "Add Part"}
      >
        <PartForm
          initialData={selectedPart}
          vendors={vendors}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          submitError={formError}
        />
      </Modal>
    </div>
  );
}
