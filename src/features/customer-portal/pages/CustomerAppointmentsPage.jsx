import { useState, useEffect, useCallback, useMemo } from "react";
import { portalApi } from "../../../api/portalApi";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Table from "../../../components/common/Table";
import "./CustomerPortal.css";

const SERVICE_TYPES = [
  "Oil Change", "Tire Service", "Brake Inspection",
  "Battery Replacement", "Engine Diagnostics", "AC Service",
  "General Maintenance", "Other",
];

const STATUS_CLASS = {
  Pending: "portal-badge portal-badge--pending",
  Confirmed: "portal-badge portal-badge--confirmed",
  Completed: "portal-badge portal-badge--completed",
  Cancelled: "portal-badge portal-badge--cancelled",
};

function formatDate(utc) {
  return new Date(utc).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function minDatetimeLocal() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function CustomerAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Booking form state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ serviceType: "", appointmentAtUtc: minDatetimeLocal(), notes: "" });

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalApi.getAppointments();
      setAppointments(res.data?.data ?? []);
    } catch {
      showNotification("error", "Could not load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  function openModal() {
    setForm({ serviceType: "", appointmentAtUtc: minDatetimeLocal(), notes: "" });
    setFormError(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!form.serviceType) errs.serviceType = "Please select a service type.";
    if (!form.appointmentAtUtc) errs.appointmentAtUtc = "Please select a date and time.";
    else if (new Date(form.appointmentAtUtc) <= new Date()) errs.appointmentAtUtc = "Must be a future date and time.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    setFormError(null);
    try {
      await portalApi.bookAppointment({
        serviceType: form.serviceType,
        appointmentAtUtc: new Date(form.appointmentAtUtc).toISOString(),
        notes: form.notes,
      });
      setModalOpen(false);
      showNotification("success", "Appointment booked successfully.");
      loadAppointments();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Could not book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Table column definitions match the admin Table component pattern
  const columns = useMemo(() => [
    { key: "serviceType", label: "SERVICE TYPE" },
    {
      key: "appointmentAtUtc",
      label: "DATE & TIME",
      render: (v) => formatDate(v),
    },
    {
      key: "notes",
      label: "NOTES",
      render: (v) => v || <span style={{ color: "var(--ink-400)" }}>—</span>,
    },
    {
      key: "status",
      label: "STATUS",
      render: (v) => <span className={STATUS_CLASS[v] ?? "portal-badge"}>{v}</span>,
    },
    {
      key: "createdAtUtc",
      label: "BOOKED ON",
      render: (v) => new Date(v).toLocaleDateString(undefined, { dateStyle: "medium" }),
    },
  ], []);

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">My Appointments</h1>
          <p className="portal-page-subtitle">Book and track your service appointments.</p>
        </div>
        <Button variant="primary" onClick={openModal}>+ Book Appointment</Button>
      </div>

      {notification && (
        <div className={`portal-notification portal-notification--${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <Table
        columns={columns}
        data={appointments}
        loading={loading}
        emptyMessage="No appointments yet. Book your first one above."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book a Service Appointment">
        <form onSubmit={handleSubmit}>
          <div className="portal-form-field">
            <label>Service Type</label>
            <select
              className="cs-input"
              value={form.serviceType}
              onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
            >
              <option value="">— Select a service —</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {formErrors.serviceType && <span className="portal-field-error">{formErrors.serviceType}</span>}
          </div>

          <div className="portal-form-field">
            <label>Preferred Date & Time</label>
            <input
              type="datetime-local"
              className="cs-input"
              min={minDatetimeLocal()}
              value={form.appointmentAtUtc}
              onChange={e => setForm(f => ({ ...f, appointmentAtUtc: e.target.value }))}
            />
            {formErrors.appointmentAtUtc && <span className="portal-field-error">{formErrors.appointmentAtUtc}</span>}
          </div>

          <div className="portal-form-field">
            <label>Notes <span className="portal-optional">(optional)</span></label>
            <textarea
              className="cs-input"
              rows={3}
              placeholder="Describe any symptoms or special requests…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
            <Button variant="primary" type="submit" loading={submitting}>
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
