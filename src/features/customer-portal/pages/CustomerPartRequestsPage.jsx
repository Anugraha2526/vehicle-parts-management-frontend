import { useState, useEffect, useCallback, useMemo } from "react";
import { portalApi } from "../../../api/portalApi";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Table from "../../../components/common/Table";
import "./CustomerPortal.css";

const STATUS_CLASS = {
  Pending:  "portal-badge portal-badge--pending",
  Approved: "portal-badge portal-badge--approved",
  Rejected: "portal-badge portal-badge--rejected",
};

export default function CustomerPartRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ requestedPartName: "", description: "" });

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalApi.getPartRequests();
      setRequests(res.data?.data ?? []);
    } catch {
      showNotification("error", "Could not load part requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  function openModal() {
    setForm({ requestedPartName: "", description: "" });
    setFormError(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!form.requestedPartName.trim()) errs.requestedPartName = "Part name is required.";
    else if (form.requestedPartName.trim().length < 3) errs.requestedPartName = "Part name must be at least 3 characters.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    setFormError(null);
    try {
      await portalApi.requestPart({
        requestedPartName: form.requestedPartName.trim(),
        description: form.description.trim(),
      });
      setModalOpen(false);
      showNotification("success", "Part request submitted. We'll notify you when it becomes available.");
      loadRequests();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo(() => [
    { key: "requestedPartName", label: "PART NAME" },
    {
      key: "description",
      label: "DETAILS",
      render: (v) => v || <span style={{ color: "var(--ink-400)" }}>—</span>,
    },
    {
      key: "status",
      label: "STATUS",
      render: (v) => <span className={STATUS_CLASS[v] ?? "portal-badge"}>{v}</span>,
    },
    {
      key: "createdAtUtc",
      label: "REQUESTED ON",
      render: (v) => new Date(v).toLocaleDateString(undefined, { dateStyle: "medium" }),
    },
  ], []);

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">Part Requests</h1>
          <p className="portal-page-subtitle">Can't find a part? Request it and we'll source it for you.</p>
        </div>
        <Button variant="primary" onClick={openModal}>+ Request a Part</Button>
      </div>

      {notification && (
        <div className={`portal-notification portal-notification--${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="No part requests yet. Click the button above to submit one."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request an Unavailable Part">
        <form onSubmit={handleSubmit}>
          <div className="portal-form-field">
            <label>Part Name</label>
            <input
              type="text"
              className="cs-input"
              placeholder="e.g. Toyota Corolla 2019 Timing Belt"
              value={form.requestedPartName}
              onChange={e => setForm(f => ({ ...f, requestedPartName: e.target.value }))}
            />
            {formErrors.requestedPartName && <span className="portal-field-error">{formErrors.requestedPartName}</span>}
          </div>

          <div className="portal-form-field">
            <label>Additional Details <span className="portal-optional">(optional)</span></label>
            <textarea
              className="cs-input"
              rows={3}
              placeholder="Include vehicle model, year, or any specific specifications…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: "vertical" }}
            />
          </div>

          {formError && (
            <div className="portal-notification portal-notification--error" style={{ marginBottom: 0 }}>
              {formError}
            </div>
          )}

          <div className="portal-form-actions">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
