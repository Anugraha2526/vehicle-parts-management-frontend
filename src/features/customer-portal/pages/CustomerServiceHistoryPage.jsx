import { useState, useEffect, useCallback, useMemo } from "react";
import { portalApi } from "../../../api/portalApi";
import Table from "../../../components/common/Table";
import "./CustomerPortal.css";

function formatRs(amount) {
  return `Rs. ${Number(amount).toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(utc) {
  return new Date(utc).toLocaleDateString(undefined, { dateStyle: "medium" });
}

const STATUS_CLASS = {
  Paid: "portal-badge portal-badge--confirmed",
  Unpaid: "portal-badge portal-badge--pending",
};

// Inline expandable items row rendered below each invoice row
function InvoiceItems({ items }) {
  if (!items || items.length === 0) return <span style={{ color: "var(--ink-400)" }}>—</span>;
  return (
    <div className="portal-invoice-items">
      {items.map((item, i) => (
        <div key={i} className="portal-invoice-item-row">
          <span>{item.partName} × {item.quantity}</span>
          <span>{formatRs(item.subTotal)}</span>
        </div>
      ))}
    </div>
  );
}

// Expandable cell that shows invoice number + toggle
function ExpandCell({ invoiceNumber, expanded, onToggle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span className="cs-mono" style={{ fontWeight: 600, fontSize: "13px" }}>{invoiceNumber}</span>
      <button className="portal-expand-btn" onClick={onToggle} type="button">
        {expanded ? "Hide" : "Items"}
      </button>
    </div>
  );
}

export default function CustomerServiceHistoryPage() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Expanded invoice rows (Set of invoice ids)
  const [expanded, setExpanded] = useState(new Set());

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await portalApi.getServiceHistory();
      setHistory(res.data?.data ?? null);
    } catch {
      setError("Could not load service history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filteredInvoices = useMemo(() => {
    if (!history?.invoices) return [];
    return history.invoices.filter(inv => {
      const matchSearch = !search.trim() ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Paid" && inv.isPaid) ||
        (statusFilter === "Unpaid" && !inv.isPaid);
      return matchSearch && matchStatus;
    });
  }, [history, search, statusFilter]);

  const columns = useMemo(() => [
    {
      key: "invoiceNumber",
      label: "INVOICE",
      render: (v, row) => (
        <ExpandCell
          invoiceNumber={v}
          expanded={expanded.has(row.id)}
          onToggle={() => toggleExpand(row.id)}
        />
      ),
    },
    {
      key: "soldAtUtc",
      label: "DATE",
      render: (v) => formatDate(v),
    },
    {
      key: "items",
      label: "PARTS",
      render: (v, row) =>
        expanded.has(row.id)
          ? <InvoiceItems items={v} />
          : <span style={{ color: "var(--ink-500)" }}>{v?.length ?? 0} item{v?.length !== 1 ? "s" : ""}</span>,
    },
    {
      key: "subTotal",
      label: "SUBTOTAL",
      render: (v) => formatRs(v),
    },
    {
      key: "discountAmount",
      label: "DISCOUNT",
      render: (v, row) =>
        row.loyaltyDiscountApplied
          ? <span style={{ color: "var(--ok-ink)", fontWeight: 600 }}>−{formatRs(v)}</span>
          : <span style={{ color: "var(--ink-400)" }}>—</span>,
    },
    {
      key: "totalAmount",
      label: "TOTAL",
      render: (v) => <span style={{ fontWeight: 700, color: "var(--ink-900)" }}>{formatRs(v)}</span>,
    },
    {
      key: "isPaid",
      label: "STATUS",
      render: (v) => <span className={v ? STATUS_CLASS.Paid : STATUS_CLASS.Unpaid}>{v ? "Paid" : "Unpaid"}</span>,
    },
  ], [expanded]);

  const stats = history
    ? [
        { label: "Total Spent", value: formatRs(history.totalSpent), meta: "Paid invoices only" },
        { label: "Invoices", value: history.invoiceCount, meta: `${history.paidCount} paid · ${history.unpaidCount} unpaid` },
        { label: "Loyalty Savings", value: formatRs(history.totalSaved), meta: "10% loyalty discount earned" },
        {
          label: "Last Purchase",
          value: history.lastPurchaseDate ? formatDate(history.lastPurchaseDate) : "—",
          meta: "Most recent invoice",
        },
      ]
    : [];

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">Service History</h1>
          <p className="portal-page-subtitle">Your complete purchase and invoice history at ChitoSpare.</p>
        </div>
      </div>

      {/* Summary stat cards */}
      {!loading && !error && history && (
        <div className="portal-stat-grid">
          {stats.map(s => (
            <div key={s.label} className="portal-stat-card">
              <p className="portal-stat-label">{s.label}</p>
              <p className="portal-stat-value">{s.value}</p>
              <p className="portal-stat-meta">{s.meta}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="portal-notification portal-notification--error" role="status">{error}</div>
      )}

      {/* Filter bar */}
      {!loading && !error && (
        <div className="portal-filter-bar">
          <input
            type="text"
            className="cs-input"
            placeholder="Search by invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="portal-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      )}

      <Table
        columns={columns}
        data={filteredInvoices}
        loading={loading}
        emptyMessage={
          history?.invoiceCount === 0
            ? "No invoices yet. Your purchase history will appear here."
            : "No invoices match your current filters."
        }
      />
    </div>
  );
}
