import React, { useEffect, useState } from 'react'
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RefreshCw,
  RotateCcw,
  X,
  Send,
  AlertCircle,
  Check,
  LockKeyhole,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './MyOrders.css'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://sarika-fashions-backend-rfwh.onrender.com/api'

// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function money(value) {
  const number = Number(value || 0)

  return `₹${number.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

function getOrderStatus(order) {
  return order?.order_status || order?.status || 'Placed'
}

function getPaymentStatus(order) {
  return order?.payment_status || 'Pending'
}

function getItemName(item) {
  return (
    item?.name ||
    item?.product_name ||
    item?.title ||
    'Saree'
  )
}

function getItemPrice(item) {
  return Number(
    item?.price ??
    item?.unit_price ??
    item?.product_price ??
    0
  )
}

function getItemQuantity(item) {
  return Number(
    item?.quantity ??
    item?.qty ??
    1
  )
}

function getItemImage(item) {
  return (
    item?.image ||
    item?.image_url ||
    item?.product_image ||
    item?.image2 ||
    ''
  )
}

function isReceived(order) {
  return (
    order?.customer_received === true ||
    order?.customer_received === 1 ||
    Number(order?.customer_received) === 1
  )
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('cancel') || value.includes('fail')) {
    return 'status-cancelled'
  }

  if (
    value.includes('closed') ||
    value.includes('deliver')
  ) {
    return 'status-delivered'
  }

  if (
    value.includes('ship') ||
    value.includes('out')
  ) {
    return 'status-shipped'
  }

  if (
    value.includes('process') ||
    value.includes('confirm')
  ) {
    return 'status-processing'
  }

  return 'status-placed'
}

function getTrackingStep(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('cancel')) return -1
  if (value.includes('closed')) return 4
  if (value.includes('deliver')) return 4
  if (value.includes('out')) return 3
  if (value.includes('ship')) return 2
  if (
    value.includes('process') ||
    value.includes('confirm')
  ) {
    return 1
  }

  return 0
}

function getReturnStatusClass(status) {
  const value = String(status || '').toLowerCase()

  if (
    value.includes('refund') ||
    value.includes('complete')
  ) {
    return 'return-status-success'
  }

  if (
    value.includes('reject') ||
    value.includes('cancel')
  ) {
    return 'return-status-rejected'
  }

  if (
    value.includes('approve') ||
    value.includes('received')
  ) {
    return 'return-status-approved'
  }

  return 'return-status-pending'
}

function getOrderTotals(order) {
  const total = Number(
    order?.total_amount ??
    order?.total ??
    order?.amount ??
    0
  )

  const shipping = Number(order?.shipping ?? 0)

  const subtotal =
    order?.subtotal !== null &&
    order?.subtotal !== undefined
      ? Number(order.subtotal)
      : Math.max(total - shipping, 0)

  return {
    subtotal,
    shipping,
    total,
  }
}

// ============================================================
// TRACKING
// ============================================================

function TrackingTimeline({ order }) {
  const status = getOrderStatus(order)
  const currentStep = getTrackingStep(status)

  if (currentStep === -1) {
    return (
      <div className="tracking-cancelled">
        <XCircle size={22} />

        <div>
          <strong>Order Cancelled</strong>
          <span>
            This order is no longer being processed.
          </span>
        </div>
      </div>
    )
  }

  const steps = [
    {
      title: 'Order Placed',
      description: order?.created_at
        ? formatDate(order.created_at)
        : 'Order received',
      icon: Package,
    },
    {
      title: 'Order Confirmed',
      description: order?.confirmed_at
        ? formatDate(order.confirmed_at)
        : 'Being prepared',
      icon: Clock3,
    },
    {
      title: 'Shipped',
      description: order?.shipped_at
        ? formatDate(order.shipped_at)
        : 'Package on the way',
      icon: Truck,
    },
    {
      title: 'Out for Delivery',
      description: order?.out_for_delivery_at
        ? formatDate(order.out_for_delivery_at)
        : 'Arriving soon',
      icon: MapPin,
    },
    {
      title: 'Delivered',
      description: order?.delivered_at
        ? formatDate(order.delivered_at)
        : 'Order delivered',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="tracking-timeline">
      {steps.map((step, index) => {
        const Icon = step.icon
        const completed = index <= currentStep
        const active = index === currentStep

        return (
          <div
            className={`tracking-step ${
              completed ? 'completed' : ''
            } ${active ? 'active' : ''}`}
            key={step.title}
          >
            <div className="tracking-icon">
              <Icon size={18} />
            </div>

            <div className="tracking-content">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>

            {index < steps.length - 1 && (
              <div className="tracking-line" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// RETURN MODAL
// ============================================================

function ReturnModal({
  order,
  onClose,
  onSuccess,
}) {
  const items = Array.isArray(order?.items)
    ? order.items
    : []

  const [selectedItem, setSelectedItem] = useState(
    items.length === 1 ? 0 : null
  )

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const reasons = [
    'Damaged / Defective',
    'Wrong Product Received',
    'Product Not as Expected',
    'Quality Issue',
    'Changed My Mind',
    'Other',
  ]

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (
      selectedItem === null ||
      selectedItem === undefined
    ) {
      setError(
        'Please select the product you want to return.'
      )
      return
    }

    if (!reason) {
      setError(
        'Please select a reason for the return.'
      )
      return
    }

    try {
      setSubmitting(true)

      const item = items[selectedItem]

      const response = await fetch(
        `${API_BASE}/returns`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            order_id: order.id || null,
            order_number:
              order.order_number || null,
            product_id:
              item.product_id ||
              item.id ||
              null,
            product_name: getItemName(item),
            quantity: getItemQuantity(item),
            reason,
            description: description.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Unable to submit return request.'
        )
      }

      onSuccess(
        data.return_request ||
        data.return ||
        data
      )
    } catch (err) {
      console.error(
        'Return request error:',
        err
      )

      setError(
        err.message ||
        'Unable to submit return request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="return-modal-overlay">
      <div className="return-modal">

        <div className="return-modal-header">
          <div>
            <span className="return-eyebrow">
              SARIKA FASHIONS
            </span>

            <h2>Request a Return</h2>

            <p>
              Order{' '}
              <strong>
                {order.order_number ||
                  `#${order.id}`}
              </strong>
            </p>
          </div>

          <button
            type="button"
            className="return-close-btn"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={21} />
          </button>
        </div>

        <form
          className="return-form"
          onSubmit={handleSubmit}
        >
          <div className="return-form-section">
            <label>Select Product</label>

            <div className="return-product-list">
              {items.length > 0 ? (
                items.map((item, index) => {
                  const selected =
                    selectedItem === index

                  return (
                    <button
                      type="button"
                      key={
                        item.id ||
                        item.product_id ||
                        index
                      }
                      className={`return-product-option ${
                        selected ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setSelectedItem(index)
                      }
                    >
                      <div className="return-product-image">
                        {getItemImage(item) ? (
                          <img
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                          />
                        ) : (
                          <Package size={25} />
                        )}
                      </div>

                      <div className="return-product-info">
                        <strong>
                          {getItemName(item)}
                        </strong>

                        <span>
                          Qty: {getItemQuantity(item)}
                        </span>

                        <small>
                          {money(getItemPrice(item))}
                        </small>
                      </div>

                      <div className="return-radio">
                        {selected && (
                          <CheckCircle2 size={20} />
                        )}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="return-no-products">
                  <Package size={22} />
                  <span>
                    Product information is unavailable.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="return-form-section">
            <label>Reason for Return</label>

            <div className="return-reasons">
              {reasons.map(returnReason => (
                <label
                  className={`return-reason ${
                    reason === returnReason
                      ? 'selected'
                      : ''
                  }`}
                  key={returnReason}
                >
                  <input
                    type="radio"
                    name="returnReason"
                    value={returnReason}
                    checked={
                      reason === returnReason
                    }
                    onChange={event =>
                      setReason(event.target.value)
                    }
                  />

                  <span>{returnReason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="return-form-section">
            <label htmlFor="returnDescription">
              Additional Information
            </label>

            <textarea
              id="returnDescription"
              value={description}
              onChange={event =>
                setDescription(event.target.value)
              }
              placeholder="Tell us more about the reason for your return..."
              rows={4}
              maxLength={500}
            />

            <small className="return-character-count">
              {description.length}/500
            </small>
          </div>

          {error && (
            <div className="return-form-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          <div className="return-info-box">
            <AlertCircle size={18} />

            <p>
              Return requests are subject to
              Sarika Fashions' return policy.
              Our team will review your request
              before approval.
            </p>
          </div>

          <div className="return-modal-actions">
            <button
              type="button"
              className="return-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="return-submit-btn"
              disabled={submitting}
            >
              <Send size={17} />

              {submitting
                ? 'Submitting...'
                : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// RECEIVE MODAL
// ============================================================

function ReceiveOrderModal({
  order,
  onClose,
  onConfirm,
  confirming,
  error,
}) {
  return (
    <div className="receive-modal-overlay">
      <div className="receive-modal">

        <div className="receive-modal-icon">
          <Package size={32} />
        </div>

        <span className="receive-eyebrow">
          SARIKA FASHIONS
        </span>

        <h2>Did you receive your order?</h2>

        <p>
          Please confirm that you have received
          order{' '}
          <strong>
            {order.order_number ||
              `#${order.id}`}
          </strong>
          .
        </p>

        <div className="receive-confirm-note">
          <CheckCircle2 size={18} />

          <span>
            Once confirmed, this order will be
            marked as received and closed.
          </span>
        </div>

        {error && (
          <div className="receive-modal-error">
            {error}
          </div>
        )}

        <div className="receive-modal-actions">
          <button
            type="button"
            className="receive-cancel-btn"
            onClick={onClose}
            disabled={confirming}
          >
            Not Yet
          </button>

          <button
            type="button"
            className="receive-confirm-btn"
            onClick={onConfirm}
            disabled={confirming}
          >
            <Check size={17} />

            {confirming
              ? 'Confirming...'
              : 'Yes, I Received It'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN
// ============================================================

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] =
    useState(null)
  const [returnOrder, setReturnOrder] = useState(null)
  const [receiveOrder, setReceiveOrder] =
    useState(null)
  const [receiveLoading, setReceiveLoading] =
    useState(false)
  const [receiveError, setReceiveError] =
    useState('')
  const [returnMessage, setReturnMessage] =
    useState('')

  // ==========================================================
  // FETCH
  // ==========================================================

  const fetchOrders = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await fetch(
        `${API_BASE}/my-orders`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Unable to load your orders.'
        )
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      )
    } catch (err) {
      console.error(
        'My Orders Error:',
        err
      )

      setError(
        err.message ||
        'Unable to load your orders.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // ==========================================================
  // TOGGLE
  // ==========================================================

  const toggleOrder = orderId => {
    setExpandedOrder(current =>
      current === orderId
        ? null
        : orderId
    )
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  const canReturnOrder = status => {
    const value =
      String(status || '').toLowerCase()

    return (
      value.includes('deliver') &&
      !value.includes('out') &&
      !value.includes('closed')
    )
  }

  // ==========================================================
  // RECEIVE
  // ==========================================================

  const canConfirmReceived = order => {
    if (!order) return false

    const status =
      String(
        order.order_status ||
        order.status ||
        ''
      ).toLowerCase()

    return (
      status.includes('deliver') &&
      !isReceived(order) &&
      !status.includes('closed')
    )
  }

  const openReceiveModal = order => {
    setReceiveError('')
    setReceiveOrder(order)
  }

  const handleReceiveConfirm = async () => {
    if (!receiveOrder?.id) return

    try {
      setReceiveLoading(true)
      setReceiveError('')

      const response = await fetch(
        `${API_BASE}/my-orders/${receiveOrder.id}/received`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Unable to confirm receipt.'
        )
      }

      console.log(
        '✅ ORDER RECEIVED:',
        data
      )

      setReceiveOrder(null)
      setReceiveError('')

      await fetchOrders(true)
    } catch (err) {
      console.error(
        '❌ RECEIVE CONFIRMATION ERROR:',
        err
      )

      setReceiveError(
        err.message ||
        'Unable to confirm receipt.'
      )
    } finally {
      setReceiveLoading(false)
    }
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  const openReturnModal = order => {
    setReturnMessage('')
    setReturnOrder(order)
  }

  const closeReturnModal = () => {
    setReturnOrder(null)
  }

  const handleReturnSuccess = returnData => {
    console.log(
      '✅ RETURN REQUEST CREATED:',
      returnData
    )

    setReturnOrder(null)

    setReturnMessage(
      'Your return request has been submitted successfully.'
    )

    fetchOrders()

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    setTimeout(() => {
      setReturnMessage('')
    }, 5000)
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="orders-loading">
            <div className="loading-spinner" />

            <h2>
              Loading your orders...
            </h2>

            <p>
              Please wait while we fetch your
              order history.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">

        {/* HEADER */}

        <div className="my-orders-header">
          <div>
            <span className="orders-eyebrow">
              SARIKA FASHIONS
            </span>

            <h1>My Orders</h1>

            <p>
              View your purchases, delivery
              status, payment details and
              return requests.
            </p>
          </div>

          <button
            type="button"
            className="refresh-orders-btn"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? 'refresh-spinning'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>
        </div>

        {/* RETURN MESSAGE */}

        {returnMessage && (
          <div className="return-success-message">
            <CheckCircle2 size={21} />

            <div>
              <strong>
                Return Request Submitted
              </strong>

              <span>
                {returnMessage}
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="orders-error">
            <XCircle size={22} />

            <div>
              <strong>
                Unable to load orders
              </strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => fetchOrders()}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="empty-order-icon">
              <ShoppingBag size={42} />
            </div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders
              with Sarika Fashions yet.
            </p>

            <Link
              to="/shop"
              className="shop-now-btn"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* ORDERS */}

        {!error && orders.length > 0 && (
          <div className="orders-list">

            {orders.map(order => {
              const orderId =
                order.id ||
                order.order_number

              const status =
                getOrderStatus(order)

              const paymentStatus =
                getPaymentStatus(order)

              const {
                subtotal,
                shipping,
                total,
              } = getOrderTotals(order)

              const isExpanded =
                expandedOrder === orderId

              const returnRequests =
                Array.isArray(
                  order.return_requests
                )
                  ? order.return_requests
                  : []

              const hasReturn =
                returnRequests.length > 0

              const latestReturn =
                hasReturn
                  ? returnRequests[
                      returnRequests.length - 1
                    ]
                  : null

              const customerReceived =
                isReceived(order)

              const orderClosed =
                customerReceived ||
                String(status).toLowerCase() ===
                  'closed'

              const receiveAllowed =
                canConfirmReceived(order)

              const returnAllowed =
                canReturnOrder(status)

              const paymentLower =
                String(paymentStatus).toLowerCase()

              const paymentSuccessful =
                paymentLower.includes('captured') ||
                paymentLower.includes('paid') ||
                paymentLower.includes('success')

              return (
                <article
                  className={`order-card ${
                    orderClosed
                      ? 'order-card-closed'
                      : ''
                  }`}
                  key={orderId}
                >

                  {/* HEADER */}

                  <div className="order-card-header">
                    <div className="order-main-info">

                      <div className="order-icon">
                        {orderClosed ? (
                          <CheckCircle2 size={21} />
                        ) : (
                          <Package size={21} />
                        )}
                      </div>

                      <div>
                        <span className="order-label">
                          Order Number
                        </span>

                        <h2>
                          {order.order_number ||
                            `#${order.id}`}
                        </h2>
                      </div>
                    </div>

                    <div className="order-date">
                      <span>Ordered on</span>

                      <strong>
                        {formatDate(
                          order.created_at
                        )}
                      </strong>

                      {formatTime(
                        order.created_at
                      ) && (
                        <small>
                          {formatTime(
                            order.created_at
                          )}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* SUMMARY */}

                  <div className="order-summary-grid">

                    <div className="order-summary-item">
                      <span>Order Status</span>

                      <strong
                        className={`status-badge ${
                          orderClosed
                            ? 'status-delivered'
                            : getStatusClass(status)
                        }`}
                      >
                        {orderClosed
                          ? 'Closed'
                          : status}
                      </strong>
                    </div>

                    <div className="order-summary-item">
                      <span>Payment</span>

                      <strong
                        className={`payment-badge ${
                          paymentSuccessful
                            ? 'payment-paid'
                            : ''
                        }`}
                      >
                        {paymentStatus}
                      </strong>
                    </div>

                    <div className="order-summary-item">
                      <span>Total Amount</span>

                      <strong>
                        {money(total)}
                      </strong>
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div className="order-address-section">
                    <div className="address-heading">
                      <MapPin size={18} />

                      <strong>
                        Delivery Address
                      </strong>
                    </div>

                    <div className="address-content">
                      <strong>
                        {order.customer_name ||
                          order.full_name ||
                          'Customer'}
                      </strong>

                      {order.customer_phone && (
                        <span>
                          {order.customer_phone}
                        </span>
                      )}

                      <p>
                        {order.address ||
                          order.address_line ||
                          ''}

                        {order.city &&
                          `, ${order.city}`}

                        {order.state &&
                          `, ${order.state}`}

                        {order.pincode &&
                          ` - ${order.pincode}`}
                      </p>
                    </div>
                  </div>

                  {/* CLOSED */}

                  {orderClosed && (
                    <div className="order-received-banner">
                      <div className="order-received-icon">
                        <CheckCircle2 size={22} />
                      </div>

                      <div>
                        <strong>
                          Order Received
                        </strong>

                        <span>
                          You confirmed that you
                          received this order.
                        </span>
                      </div>

                      <div className="order-closed-badge">
                        <LockKeyhole size={15} />
                        Order Closed
                      </div>
                    </div>
                  )}

                  {/* RETURN */}

                  {latestReturn && (
                    <div className="return-status-card">
                      <div className="return-status-icon">
                        <RotateCcw size={20} />
                      </div>

                      <div className="return-status-content">
                        <span>
                          Return Request
                        </span>

                        <strong
                          className={getReturnStatusClass(
                            latestReturn.return_status ||
                              latestReturn.status
                          )}
                        >
                          {latestReturn.return_status ||
                            latestReturn.status ||
                            'Requested'}
                        </strong>

                        {latestReturn.product_name && (
                          <small>
                            {latestReturn.product_name}
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="order-actions">

                    <button
                      type="button"
                      className="track-order-btn"
                      onClick={() =>
                        toggleOrder(orderId)
                      }
                    >
                      <Truck size={17} />

                      {isExpanded
                        ? 'Hide Tracking'
                        : 'Track Order'}

                      {isExpanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </button>

                    {receiveAllowed && (
                      <button
                        type="button"
                        className="receive-order-btn"
                        onClick={() =>
                          openReceiveModal(order)
                        }
                      >
                        <CheckCircle2 size={17} />
                        I Received My Order
                      </button>
                    )}

                    {returnAllowed && !hasReturn && (
                      <button
                        type="button"
                        className="return-order-btn"
                        onClick={() =>
                          openReturnModal(order)
                        }
                      >
                        <RotateCcw size={17} />
                        Return Item
                      </button>
                    )}

                    {hasReturn && (
                      <span className="return-already-requested">
                        <CheckCircle2 size={16} />
                        Return Requested
                      </span>
                    )}
                  </div>

                  {/* EXPANDED */}

                  {isExpanded && (
                    <div className="order-expanded">

                      {/* TRACKING */}

                      <div className="expanded-section">
                        <h3>
                          <Truck size={19} />
                          Order Tracking
                        </h3>

                        <TrackingTimeline
                          order={order}
                        />
                      </div>

                      {/* PAYMENT */}

                      <div className="expanded-section">
                        <h3>
                          <CreditCard size={19} />
                          Payment Details
                        </h3>

                        <div className="details-grid">

                          <div>
                            <span>
                              Payment Status
                            </span>

                            <strong>
                              {paymentStatus}
                            </strong>
                          </div>

                          {(
                            order.razorpay_payment_id ||
                            order.payment_id
                          ) && (
                            <div>
                              <span>
                                Payment ID
                              </span>

                              <strong>
                                {order.razorpay_payment_id ||
                                  order.payment_id}
                              </strong>
                            </div>
                          )}

                          {order.razorpay_order_id && (
                            <div>
                              <span>
                                Razorpay Order
                              </span>

                              <strong>
                                {order.razorpay_order_id}
                              </strong>
                            </div>
                          )}

                          <div>
                            <span>
                              Subtotal
                            </span>

                            <strong>
                              {money(subtotal)}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Shipping
                            </span>

                            <strong>
                              {shipping === 0
                                ? 'FREE'
                                : money(shipping)}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Amount Paid
                            </span>

                            <strong>
                              {money(total)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* ITEMS */}

                      <div className="expanded-section">
                        <h3>
                          <Package size={19} />
                          Order Details
                        </h3>

                        {Array.isArray(order.items) &&
                        order.items.length > 0 ? (
                          <div className="order-items">

                            {order.items.map(
                              (item, index) => {
                                const itemPrice =
                                  getItemPrice(item)

                                const quantity =
                                  getItemQuantity(item)

                                const image =
                                  getItemImage(item)

                                return (
                                  <div
                                    className="order-item"
                                    key={
                                      item.id ||
                                      item.product_id ||
                                      index
                                    }
                                  >
                                    <div className="order-item-image">
                                      {image ? (
                                        <img
                                          src={image}
                                          alt={getItemName(
                                            item
                                          )}
                                        />
                                      ) : (
                                        <Package
                                          size={25}
                                        />
                                      )}
                                    </div>

                                    <div className="order-item-info">
                                      <strong>
                                        {getItemName(
                                          item
                                        )}
                                      </strong>

                                      <span>
                                        Qty: {quantity}
                                      </span>

                                      <small>
                                        {money(itemPrice)}
                                        {' '}each
                                      </small>
                                    </div>

                                    <strong>
                                      {money(
                                        itemPrice *
                                          quantity
                                      )}
                                    </strong>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        ) : (
                          <p className="no-item-data">
                            Product details are
                            available in your order
                            record.
                          </p>
                        )}
                      </div>

                      {/* PRICE BREAKDOWN */}

                      <div className="expanded-section">
                        <h3>
                          <ShoppingBag size={19} />
                          Price Summary
                        </h3>

                        <div className="price-summary">
                          <div>
                            <span>Subtotal</span>
                            <strong>
                              {money(subtotal)}
                            </strong>
                          </div>

                          <div>
                            <span>Shipping</span>
                            <strong>
                              {shipping === 0
                                ? 'FREE'
                                : money(shipping)}
                            </strong>
                          </div>

                          <div className="price-summary-total">
                            <span>Total Paid</span>
                            <strong>
                              {money(total)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* RETURN DETAILS */}

                      {latestReturn && (
                        <div className="expanded-section">
                          <h3>
                            <RotateCcw size={19} />
                            Return Details
                          </h3>

                          <div className="return-details-grid">

                            <div>
                              <span>Product</span>

                              <strong>
                                {latestReturn.product_name ||
                                  'Product'}
                              </strong>
                            </div>

                            <div>
                              <span>Reason</span>

                              <strong>
                                {latestReturn.reason ||
                                  'Not specified'}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Return Status
                              </span>

                              <strong
                                className={getReturnStatusClass(
                                  latestReturn.return_status ||
                                    latestReturn.status
                                )}
                              >
                                {latestReturn.return_status ||
                                  latestReturn.status ||
                                  'Requested'}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Refund Status
                              </span>

                              <strong>
                                {latestReturn.refund_status ||
                                  'Pending'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CLOSED */}

                      {orderClosed && (
                        <div className="expanded-section order-closed-section">
                          <h3>
                            <LockKeyhole size={19} />
                            Order Closed
                          </h3>

                          <div className="closed-order-message">
                            <CheckCircle2 size={24} />

                            <div>
                              <strong>
                                Order successfully
                                received
                              </strong>

                              <span>
                                You confirmed that
                                this order has been
                                received. The order
                                is now closed.
                              </span>

                              {order.received_at && (
                                <small>
                                  Received on:{' '}
                                  {formatDate(
                                    order.received_at
                                  )}{' '}
                                  {formatTime(
                                    order.received_at
                                  )}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* RETURN MODAL */}

      {returnOrder && (
        <ReturnModal
          order={returnOrder}
          onClose={closeReturnModal}
          onSuccess={handleReturnSuccess}
        />
      )}

      {/* RECEIVE MODAL */}

      {receiveOrder && (
        <ReceiveOrderModal
          order={receiveOrder}
          onClose={() =>
            setReceiveOrder(null)
          }
          onConfirm={handleReceiveConfirm}
          confirming={receiveLoading}
          error={receiveError}
        />
      )}
    </div>
  )
}