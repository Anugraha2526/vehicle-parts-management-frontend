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

// Renders star icons for a rating value out of 5
function StarRating({ rating }) {
  return (
    <span className="portal-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? "portal-star portal-star--filled" : "portal-star"}>★</span>
      ))}
    </span>
  );
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ rating: 0, serviceType: "", comment: "" });

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalApi.getReviews();
      setReviews(res.data?.data ?? []);
    } catch {
      showNotification("error", "Could not load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  function openModal() {
    setForm({ rating: 0, serviceType: "", comment: "" });
    setFormError(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!form.rating || form.rating < 1) errs.rating = "Please select a star rating.";
    if (!form.serviceType) errs.serviceType = "Please select a service type.";
    if (!form.comment.trim()) errs.comment = "Please write a comment.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    setFormError(null);
    try {
      await portalApi.submitReview({ rating: form.rating, serviceType: form.serviceType, comment: form.comment });
      setModalOpen(false);
      showNotification("success", "Thank you for your feedback!");
      loadReviews();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo(() => [
    { key: "customerName", label: "CUSTOMER" },
    { key: "serviceType", label: "SERVICE TYPE" },
    {
      key: "rating",
      label: "RATING",
      render: (v) => <StarRating rating={v} />,
    },
    {
      key: "comment",
      label: "COMMENT",
      render: (v) => <span style={{ color: "var(--ink-700)" }}>{v}</span>,
    },
    {
      key: "createdAtUtc",
      label: "DATE",
      render: (v) => new Date(v).toLocaleDateString(undefined, { dateStyle: "medium" }),
    },
  ], []);

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">Service Reviews</h1>
          <p className="portal-page-subtitle">Read customer feedback or share your own experience.</p>
        </div>
        <Button variant="primary" onClick={openModal}>+ Write a Review</Button>
      </div>

      {notification && (
        <div className={`portal-notification portal-notification--${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <Table
        columns={columns}
        data={reviews}
        loading={loading}
        emptyMessage="No reviews yet. Be the first to share your experience."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Write a Review">
        <form onSubmit={handleSubmit}>
          {/* Interactive star picker */}
          <div className="portal-form-field">
            <label>Your Rating</label>
            <div className="portal-star-picker">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`portal-star-btn${n <= form.rating ? " portal-star-btn--active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              {form.rating > 0 && <span className="portal-star-label">{form.rating} / 5</span>}
            </div>
            {formErrors.rating && <span className="portal-field-error">{formErrors.rating}</span>}
          </div>

          <div className="portal-form-field">
            <label>Service Type</label>
            <select
              className="cs-input"
              value={form.serviceType}
              onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
            >
              <option value="">— Select the service you received —</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {formErrors.serviceType && <span className="portal-field-error">{formErrors.serviceType}</span>}
          </div>

          <div className="portal-form-field">
            <label>Comment</label>
            <textarea
              className="cs-input"
              rows={4}
              placeholder="Tell us about your experience…"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              style={{ resize: "vertical" }}
            />
            {formErrors.comment && <span className="portal-field-error">{formErrors.comment}</span>}
          </div>

          {formError && (
            <div className="portal-notification portal-notification--error" style={{ marginBottom: 0 }}>
              {formError}
            </div>
          )}

          <div className="portal-form-actions">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
