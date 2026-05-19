import { useState, useEffect, useCallback, useMemo } from "react";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import { adminPartRequestsApi } from "../../../api/partsApi";
import "./PartRequestsPanel.css";

export default function PartRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load pending requests once when the panel mounts
  useEffect(() => {
    adminPartRequestsApi.getAll()
      .then((res) => setRequests(res.data?.data ?? []))
      .catch(() => setError("Could not load part requests. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  // useCallback so the memoized columns array does not rebuild on unrelated re-renders
  const handleApprove = useCallback(async (id) => {
    try {
      await adminPartRequestsApi.approve(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not approve request. Please try again.");
    }
  }, []);

  const handleReject = useCallback(async (id) => {
    try {
      await adminPartRequestsApi.reject(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not reject request. Please try again.");
    }
  }, []);

  const columns = useMemo(() => [
    { key: "requestedPartName", label: "PART NAME" },
    { key: "customerName", label: "REQUESTED BY" },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (value) => value || <span className="pr-empty">—</span>,
    },
    {
      key: "createdAtUtc",
      label: "DATE",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <div className="pr-actions">
          <Button variant="primary" size="sm" onClick={() => handleApprove(row.id)}>
            Approve
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleReject(row.id)}>
            Reject
          </Button>
        </div>
      ),
    },
  ], [handleApprove, handleReject]);

  return (
    <div className="pr-section">
      <div className="pr-section-header">
        <div>
          <h2 className="pr-section-title">Customer Part Requests</h2>
          <p className="parts-page-subtitle">Review and respond to parts requested by customers</p>
        </div>
        {requests.length > 0 && (
          <span className="pr-count">{requests.length} pending</span>
        )}
      </div>

      {error && (
        <div className="pr-error" role="alert">{error}</div>
      )}

      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="No pending part requests."
      />
    </div>
  );
}
