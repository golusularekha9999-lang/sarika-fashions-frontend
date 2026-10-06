import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  PackageCheck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "./AdminReturns.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://sarika-fashions-backend-rfwh.onrender.com/api";

const REQUESTED = "Return Requested";

const RETURN_STATUSES = [
  REQUESTED,
  "Approved",
  "Received",
  "Completed",
  "Rejected",
];

const REFUND_STATUSES = [
  "Not Initiated",
  "Pending",
  "Processing",
  "Refunded",
  "Failed",
];

const FILTER_OPTIONS = ["All", ...RETURN_STATUSES];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  if (!status) return "status-default";

  const value = status.toLowerCase();

  if (value.includes("requested")) return "status-requested";
  if (value.includes("approved")) return "status-approved";
  if (value.includes("received")) return "status-received";
  if (value.includes("completed")) return "status-completed";
  if (value.includes("rejected")) return "status-rejected";
  if (value.includes("refunded")) return "status-refunded";
  if (value.includes("pending")) return "status-pending";
  if (value.includes("processing")) return "status-processing";
  if (value.includes("failed")) return "status-failed";

  return "status-default";
}

function StatusIcon({ status }) {
  const value = (status || "").toLowerCase();

  if (value.includes("completed") || value.includes("refunded")) {
    return <CheckCircle2 size={15} />;
  }

  if (value.includes("rejected") || value.includes("failed")) {
    return <XCircle size={15} />;
  }

  if (value.includes("received")) {
    return <PackageCheck size={15} />;
  }

  if (value.includes("approved")) {
    return <CheckCircle2 size={15} />;
  }

  if (value.includes("pending") || value.includes("processing")) {
    return <Clock3 size={15} />;
  }

  return <AlertCircle size={15} />;
}

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // --------------------------------------------------
  // FETCH RETURN REQUESTS
  // --------------------------------------------------
  const fetchReturns = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_BASE}/admin/returns`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to load return requests (${response.status})`
        );
      }

      const returnList = Array.isArray(data.returns)
        ? data.returns
        : [];

      setReturns(returnList);
    } catch (err) {
      console.error("Admin returns fetch error:", err);

      setError(
        err.message ||
          "Unable to load return requests. Please try again."
      );

      setReturns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------
  useEffect(() => {
    fetchReturns();
  }, []);

  // --------------------------------------------------
  // FILTER + SEARCH
  // --------------------------------------------------
  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesStatus =
        statusFilter === "All" ||
        item.return_status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        item.id,
        item.order_id,
        item.order_number,
        item.product_id,
        item.product_name,
        item.customer_name,
        item.customer_email,
        item.customer_phone,
        item.reason,
        item.description,
        item.return_status,
        item.refund_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [returns, search, statusFilter]);

  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------
  const summary = useMemo(() => {
    return {
      total: returns.length,

      requested: returns.filter(
        (item) => item.return_status === REQUESTED
      ).length,

      approved: returns.filter(
        (item) => item.return_status === "Approved"
      ).length,

      received: returns.filter(
        (item) => item.return_status === "Received"
      ).length,

      completed: returns.filter(
        (item) => item.return_status === "Completed"
      ).length,

      rejected: returns.filter(
        (item) => item.return_status === "Rejected"
      ).length,

      refunded: returns.filter(
        (item) => item.refund_status === "Refunded"
      ).length,
    };
  }, [returns]);

  // --------------------------------------------------
  // UPDATE RETURN
  // --------------------------------------------------
  const updateReturn = async (returnId, changes) => {
    try {
      setUpdatingId(returnId);
      setError("");

      const response = await fetch(
        `${API_BASE}/admin/returns/${returnId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(changes),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to update return (${response.status})`
        );
      }

      // Update table immediately
      setReturns((current) =>
        current.map((item) =>
          Number(item.id) === Number(returnId)
            ? {
                ...item,
                ...changes,
              }
            : item
        )
      );

      // Update opened modal also
      setSelectedReturn((current) => {
        if (!current || Number(current.id) !== Number(returnId)) {
          return current;
        }

        return {
          ...current,
          ...changes,
        };
      });
    } catch (err) {
      console.error("Update return error:", err);

      setError(
        err.message ||
          "Unable to update return request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------
  const closeModal = () => {
    setSelectedReturn(null);
  };

  return (
    <div className="admin-returns-page">

      {/* HEADER */}
      <div className="admin-returns-header">
        <div>
          <h1>Return Requests</h1>

          <p>
            Manage customer return requests and refund status.
          </p>
        </div>

        <button
          type="button"
          className="admin-returns-refresh"
          onClick={() => fetchReturns(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-returns-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => fetchReturns(true)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="admin-returns-summary">

        <div className="return-summary-card">
          <span>Total Returns</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="return-summary-card">
          <span>Requested</span>
          <strong>{summary.requested}</strong>
        </div>

        <div className="return-summary-card">
          <span>Approved</span>
          <strong>{summary.approved}</strong>
        </div>

        <div className="return-summary-card">
          <span>Received</span>
          <strong>{summary.received}</strong>
        </div>

        <div className="return-summary-card">
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </div>

        <div className="return-summary-card">
          <span>Refunded</span>
          <strong>{summary.refunded}</strong>
        </div>

      </div>

      {/* FILTERS */}
      <div className="admin-returns-toolbar">

        <div className="return-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search order, customer, product..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="return-status-filter"
        >
          {FILTER_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

      </div>

      {/* TABLE */}
      <div className="admin-returns-table-wrapper">

        {loading ? (
          <div className="admin-returns-loading">
            <RefreshCw size={24} className="spin" />
            <p>Loading return requests...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="admin-returns-empty">
            <PackageCheck size={42} />

            <h3>No return requests found</h3>

            <p>
              {returns.length === 0
                ? "There are currently no return requests in the database."
                : "No return requests match your current search or filter."}
            </p>
          </div>
        ) : (
          <table className="admin-returns-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Reason</th>
                <th>Requested At</th>
                <th>Return Status</th>
                <th>Refund Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.map((item) => (
                <tr key={item.id}>

                  <td>
                    <strong>#{item.id}</strong>
                  </td>

                  <td>
                    <strong>
                      {item.order_number ||
                        `Order #${item.order_id}`}
                    </strong>
                  </td>

                  <td>
                    <div className="return-customer-cell">
                      <strong>
                        {item.customer_name || "—"}
                      </strong>

                      <span>
                        {item.customer_email || "—"}
                      </span>

                      {item.customer_phone && (
                        <small>
                          {item.customer_phone}
                        </small>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="return-product-cell">
                      <strong>
                        {item.product_name || "—"}
                      </strong>

                      <span>
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                  </td>

                  <td>
                    {item.reason || "—"}
                  </td>

                  <td>
                    {formatDate(item.requested_at)}
                  </td>

                  <td>
                    <span
                      className={`return-status-badge ${getStatusClass(
                        item.return_status
                      )}`}
                    >
                      <StatusIcon
                        status={item.return_status}
                      />

                      {item.return_status || REQUESTED}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`return-status-badge ${getStatusClass(
                        item.refund_status
                      )}`}
                    >
                      <StatusIcon
                        status={item.refund_status}
                      />

                      {item.refund_status ||
                        "Not Initiated"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="return-view-button"
                      onClick={() =>
                        setSelectedReturn(item)
                      }
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* DETAILS MODAL */}
      {selectedReturn && (
        <div
          className="return-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="return-modal">

            <div className="return-modal-header">

              <div>
                <span>Return Request</span>

                <h2>
                  #{selectedReturn.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="return-modal-close"
              >
                <X size={20} />
              </button>

            </div>

            {/* CUSTOMER */}
            <div className="return-modal-section">

              <h3>Customer Details</h3>

              <div className="return-details-grid">

                <div>
                  <label>Name</label>
                  <p>
                    {selectedReturn.customer_name ||
                      "—"}
                  </p>
                </div>

                <div>
                  <label>Email</label>
                  <p>
                    {selectedReturn.customer_email ||
                      "—"}
                  </p>
                </div>

                <div>
                  <label>Phone</label>
                  <p>
                    {selectedReturn.customer_phone ||
                      "—"}
                  </p>
                </div>

              </div>

            </div>

            {/* ORDER */}
            <div className="return-modal-section">

              <h3>Order Details</h3>

              <div className="return-details-grid">

                <div>
                  <label>Order Number</label>
                  <p>
                    {selectedReturn.order_number ||
                      `#${selectedReturn.order_id}`}
                  </p>
                </div>

                <div>
                  <label>Product</label>
                  <p>
                    {selectedReturn.product_name ||
                      "—"}
                  </p>
                </div>

                <div>
                  <label>Quantity</label>
                  <p>
                    {selectedReturn.quantity || 1}
                  </p>
                </div>

                <div>
                  <label>Requested At</label>
                  <p>
                    {formatDate(
                      selectedReturn.requested_at
                    )}
                  </p>
                </div>

              </div>

            </div>

            {/* REASON */}
            <div className="return-modal-section">

              <h3>Return Reason</h3>

              <p className="return-reason-text">
                {selectedReturn.reason || "—"}
              </p>

              {selectedReturn.description && (
                <>
                  <h4>Description</h4>

                  <p className="return-description-text">
                    {selectedReturn.description}
                  </p>
                </>
              )}

            </div>

            {/* STATUS */}
            <div className="return-modal-section">

              <h3>Manage Return</h3>

              <div className="return-management-grid">

                <div className="return-management-field">

                  <label>Return Status</label>

                  <select
                    value={
                      selectedReturn.return_status ||
                      REQUESTED
                    }
                    disabled={
                      updatingId === selectedReturn.id
                    }
                    onChange={(event) =>
                      updateReturn(
                        selectedReturn.id,
                        {
                          return_status:
                            event.target.value,
                        }
                      )
                    }
                  >
                    {RETURN_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="return-management-field">

                  <label>Refund Status</label>

                  <select
                    value={
                      selectedReturn.refund_status ||
                      "Not Initiated"
                    }
                    disabled={
                      updatingId === selectedReturn.id
                    }
                    onChange={(event) =>
                      updateReturn(
                        selectedReturn.id,
                        {
                          refund_status:
                            event.target.value,
                        }
                      )
                    }
                  >
                    {REFUND_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

              {/* ADMIN NOTE */}
              <div className="return-management-field">

                <label>Admin Note</label>

                <textarea
                  rows="4"
                  defaultValue={
                    selectedReturn.admin_note || ""
                  }
                  placeholder="Add an internal note..."
                  onBlur={(event) => {
                    const newNote =
                      event.target.value;

                    if (
                      newNote !==
                      (selectedReturn.admin_note || "")
                    ) {
                      updateReturn(
                        selectedReturn.id,
                        {
                          admin_note: newNote,
                        }
                      );
                    }
                  }}
                  disabled={
                    updatingId === selectedReturn.id
                  }
                />

              </div>

            </div>

            <div className="return-modal-footer">

              {updatingId === selectedReturn.id && (
                <span className="return-updating-text">
                  Saving changes...
                </span>
              )}

              <button
                type="button"
                className="return-close-button"
                onClick={closeModal}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
