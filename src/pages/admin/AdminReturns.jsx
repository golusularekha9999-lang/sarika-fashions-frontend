import React, { useMemo, useState } from 'react'
import {
  RotateCcw,
  Search,
  Eye,
  X,
  Package,
  User,
  CalendarDays,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Truck,
} from 'lucide-react'

import './AdminReturns.css'

const returnStatuses = [
  'Requested',
  'Approved',
  'Received',
  'Completed',
  'Rejected',
]

const refundStatuses = [
  'Not Started',
  'Pending',
  'Processing',
  'Refunded',
  'Failed',
]

function formatDate(dateString) {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusIcon(status) {
  switch (status) {
    case 'Completed':
    case 'Approved':
      return <CheckCircle2 size={15} />

    case 'Rejected':
      return <XCircle size={15} />

    case 'Received':
      return <Truck size={15} />

    default:
      return <Clock3 size={15} />
  }
}

function getStatusClass(status) {
  return String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export default function AdminReturns() {
  // ============================================================
  // NO FAKE DATA
  // This will later be replaced with API data from Flask/MySQL.
  // ============================================================

  const [returns, setReturns] = useState([])

  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedReturn, setSelectedReturn] = useState(null)

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase()

    return returns.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' ||
        item.return_status === activeFilter

      const matchesSearch =
        !query ||
        String(item.order_number || '')
          .toLowerCase()
          .includes(query) ||
        String(item.customer_name || '')
          .toLowerCase()
          .includes(query) ||
        String(item.customer_email || '')
          .toLowerCase()
          .includes(query) ||
        String(item.product_name || '')
          .toLowerCase()
          .includes(query) ||
        String(item.reason || '')
          .toLowerCase()
          .includes(query)

      return matchesFilter && matchesSearch
    })
  }, [returns, activeFilter, search])

  const summary = useMemo(() => {
    return {
      total: returns.length,

      requested: returns.filter(
        (item) => item.return_status === 'Requested'
      ).length,

      approved: returns.filter(
        (item) => item.return_status === 'Approved'
      ).length,

      received: returns.filter(
        (item) => item.return_status === 'Received'
      ).length,

      completed: returns.filter(
        (item) => item.return_status === 'Completed'
      ).length,

      rejected: returns.filter(
        (item) => item.return_status === 'Rejected'
      ).length,
    }
  }, [returns])

  const updateReturn = (id, changes) => {
    setReturns((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    )

    setSelectedReturn((current) =>
      current && current.id === id
        ? {
            ...current,
            ...changes,
          }
        : current
    )
  }

  const handleReturnStatusChange = (id, status) => {
    updateReturn(id, {
      return_status: status,
    })
  }

  const handleRefundStatusChange = (id, status) => {
    updateReturn(id, {
      refund_status: status,
    })
  }

  return (
    <div className="admin-returns-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="admin-returns-header">
        <div className="admin-returns-title-row">

          <div className="admin-returns-title-icon">
            <RotateCcw size={24} />
          </div>

          <div>
            <h1>Return Requests</h1>

            <p>
              Manage customer return and refund requests
            </p>
          </div>

        </div>
      </div>


      {/* ========================================================
          SUMMARY CARDS
      ======================================================== */}

      <div className="admin-returns-summary">

        <div className="return-summary-card">
          <div className="return-summary-icon all">
            <RotateCcw size={20} />
          </div>

          <div>
            <span>Total Returns</span>
            <strong>{summary.total}</strong>
          </div>
        </div>


        <div className="return-summary-card">
          <div className="return-summary-icon requested">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Requested</span>
            <strong>{summary.requested}</strong>
          </div>
        </div>


        <div className="return-summary-card">
          <div className="return-summary-icon approved">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{summary.approved}</strong>
          </div>
        </div>


        <div className="return-summary-card">
          <div className="return-summary-icon received">
            <Truck size={20} />
          </div>

          <div>
            <span>Received</span>
            <strong>{summary.received}</strong>
          </div>
        </div>


        <div className="return-summary-card">
          <div className="return-summary-icon completed">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>

      </div>


      {/* ========================================================
          TOOLBAR
      ======================================================== */}

      <div className="admin-returns-toolbar">

        <div className="return-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search order, customer or product..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="return-search-clear"
              onClick={() => setSearch('')}
            >
              <X size={16} />
            </button>
          )}

        </div>


        <div className="return-filter-buttons">

          {[
            'All',
            'Requested',
            'Approved',
            'Received',
            'Completed',
            'Rejected',
          ].map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveFilter(filter)
              }
            >
              {filter}
            </button>
          ))}

        </div>

      </div>


      {/* ========================================================
          RETURN TABLE
      ======================================================== */}

      <div className="admin-returns-table-card">

        <div className="admin-returns-table-header">

          <div>
            <h2>Return Requests</h2>

            <span>
              Showing {filteredReturns.length} of{' '}
              {returns.length} requests
            </span>
          </div>

        </div>


        {filteredReturns.length === 0 ? (

          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <div className="returns-empty-state">

            <div className="returns-empty-icon">
              <RotateCcw size={32} />
            </div>

            <h3>No returns yet</h3>

            <p>
              Customer return requests will appear here
              once they are submitted.
            </p>

          </div>

        ) : (

          /* ====================================================
             TABLE
          ==================================================== */

          <div className="admin-returns-table-wrapper">

            <table className="admin-returns-table">

              <thead>
                <tr>
                  <th>RETURN</th>
                  <th>CUSTOMER</th>
                  <th>PRODUCT</th>
                  <th>REASON</th>
                  <th>REQUESTED</th>
                  <th>RETURN STATUS</th>
                  <th>REFUND</th>
                  <th>ACTION</th>
                </tr>
              </thead>


              <tbody>

                {filteredReturns.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="return-order-cell">

                        <strong>
                          {item.order_number}
                        </strong>

                        <span>
                          Return #{item.id}
                        </span>

                      </div>
                    </td>


                    <td>

                      <div className="return-customer-cell">

                        <div className="return-customer-avatar">
                          {item.customer_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {item.customer_name}
                          </strong>

                          <span>
                            {item.customer_email}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>

                      <div className="return-product-cell">

                        <div className="return-product-placeholder">
                          <Package size={18} />
                        </div>

                        <div>

                          <strong>
                            {item.product_name}
                          </strong>

                          <span>
                            Qty: {item.quantity}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>

                      <span className="return-reason">
                        {item.reason}
                      </span>

                    </td>


                    <td>

                      <div className="return-date-cell">

                        <strong>
                          {formatDate(
                            item.requested_at
                          )}
                        </strong>

                        <span>
                          {formatTime(
                            item.requested_at
                          )}
                        </span>

                      </div>

                    </td>


                    <td>

                      <span
                        className={`return-status-badge ${getStatusClass(
                          item.return_status
                        )}`}
                      >

                        {getStatusIcon(
                          item.return_status
                        )}

                        {item.return_status}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`refund-status-badge ${getStatusClass(
                          item.refund_status
                        )}`}
                      >
                        {item.refund_status}
                      </span>

                    </td>


                    <td>

                      <button
                        type="button"
                        className="return-view-btn"
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

          </div>

        )}

      </div>


      {/* ========================================================
          DETAIL MODAL
      ======================================================== */}

      {selectedReturn && (

        <div
          className="return-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedReturn(null)
            }

          }}
        >

          <div className="return-modal">

            <div className="return-modal-header">

              <div>

                <span className="return-modal-label">
                  RETURN REQUEST
                </span>

                <h2>
                  #{selectedReturn.order_number}
                </h2>

              </div>


              <button
                type="button"
                className="return-modal-close"
                onClick={() =>
                  setSelectedReturn(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="return-modal-body">

              {/* CUSTOMER */}

              <section className="return-detail-section">

                <div className="return-detail-heading">

                  <User size={18} />

                  <h3>
                    Customer Information
                  </h3>

                </div>


                <div className="return-detail-grid">

                  <div>
                    <span>Name</span>

                    <strong>
                      {selectedReturn.customer_name}
                    </strong>
                  </div>


                  <div>
                    <span>Email</span>

                    <strong>
                      {selectedReturn.customer_email}
                    </strong>
                  </div>


                  <div>
                    <span>Phone</span>

                    <strong>
                      {selectedReturn.customer_phone}
                    </strong>
                  </div>

                </div>

              </section>


              {/* PRODUCT */}

              <section className="return-detail-section">

                <div className="return-detail-heading">

                  <Package size={18} />

                  <h3>
                    Product Information
                  </h3>

                </div>


                <div className="return-product-detail-card">

                  <div className="return-product-large-placeholder">
                    <Package size={30} />
                  </div>


                  <div className="return-product-large-info">

                    <h4>
                      {selectedReturn.product_name}
                    </h4>

                    <p>
                      Product ID:{' '}
                      {selectedReturn.product_id}
                    </p>

                    <p>
                      Quantity:{' '}
                      {selectedReturn.quantity}
                    </p>

                    <strong>
                      <IndianRupee size={15} />
                      {Number(
                        selectedReturn.price
                      ).toLocaleString('en-IN')}
                    </strong>

                  </div>

                </div>

              </section>


              {/* RETURN REASON */}

              <section className="return-detail-section">

                <div className="return-detail-heading">

                  <AlertCircle size={18} />

                  <h3>
                    Return Reason
                  </h3>

                </div>


                <div className="return-reason-box">

                  <strong>
                    {selectedReturn.reason}
                  </strong>

                  <p>
                    {selectedReturn.description ||
                      'No additional description provided.'}
                  </p>

                </div>

              </section>


              {/* STATUS */}

              <section className="return-detail-section">

                <div className="return-detail-heading">

                  <RotateCcw size={18} />

                  <h3>
                    Update Return
                  </h3>

                </div>


                <div className="return-status-controls">

                  <div className="return-control">

                    <label>
                      Return Status
                    </label>

                    <select
                      value={
                        selectedReturn.return_status
                      }
                      onChange={(event) =>
                        handleReturnStatusChange(
                          selectedReturn.id,
                          event.target.value
                        )
                      }
                    >

                      {returnStatuses.map(
                        (status) => (

                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="return-control">

                    <label>
                      Refund Status
                    </label>

                    <select
                      value={
                        selectedReturn.refund_status
                      }
                      onChange={(event) =>
                        handleRefundStatusChange(
                          selectedReturn.id,
                          event.target.value
                        )
                      }
                    >

                      {refundStatuses.map(
                        (status) => (

                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              </section>


              {/* REQUEST INFORMATION */}

              <section className="return-detail-section">

                <div className="return-detail-heading">

                  <CalendarDays size={18} />

                  <h3>
                    Request Information
                  </h3>

                </div>


                <div className="return-request-info">

                  <div>
                    <span>
                      Requested On
                    </span>

                    <strong>
                      {formatDate(
                        selectedReturn.requested_at
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Request Time
                    </span>

                    <strong>
                      {formatTime(
                        selectedReturn.requested_at
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Order Number
                    </span>

                    <strong>
                      {selectedReturn.order_number}
                    </strong>
                  </div>

                </div>

              </section>

            </div>


            {/* MODAL FOOTER */}

            <div className="return-modal-footer">

              <button
                type="button"
                className="return-close-btn"
                onClick={() =>
                  setSelectedReturn(null)
                }
              >
                Close
              </button>


              <div className="return-footer-status">

                <span>
                  Current Status
                </span>

                <strong
                  className={`return-status-badge ${getStatusClass(
                    selectedReturn.return_status
                  )}`}
                >

                  {getStatusIcon(
                    selectedReturn.return_status
                  )}

                  {selectedReturn.return_status}

                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}