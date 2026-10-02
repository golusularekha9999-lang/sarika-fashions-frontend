import SarikaLoader from '../components/Loader.jsx'
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
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './MyOrders.css'

// ============================================================
// API CONFIG
// ============================================================

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api'
    : 'https://sarika-fashions-backend-rfwh.onrender.com/api')

// ============================================================
// CUSTOMER STORAGE
// ============================================================

const CUSTOMER_TOKEN_KEY = 'sarika_customer_order_token'
const CUSTOMER_PHONE_KEY = 'sarika_customer_phone'

function getCustomerOrderToken() {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY)
  } catch (error) {
    return null
  }
}

function getCustomerOrderHeaders() {
  const token = getCustomerOrderToken()
  return {
    Accept: 'application/json',
    ...(token ? { 'X-Customer-Order-Token': token } : {}),
  }
}

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
  return `₹${number.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function getOrderStatus(order) {
  return order?.order_status || order?.status || 'Placed'
}

function getPaymentStatus(order) {
  return order?.payment_status || 'Pending'
}

function getItemName(item) {
  return item?.name || item?.product_name || item?.title || 'Saree'
}

function getItemPrice(item) {
  return Number(item?.price ?? item?.unit_price ?? item?.product_price ?? 0)
}

function getItemQuantity(item) {
  return Number(item?.quantity ?? item?.qty ?? 1)
}

function getItemImage(item) {
  return item?.image || item?.image_url || item?.product_image || item?.image2 || ''
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
  if (value.includes('cancel') || value.includes('fail')) return 'status-cancelled'
  if (value.includes('closed') || value.includes('deliver')) return 'status-delivered'
  if (value.includes('ship') || value.includes('out')) return 'status-shipped'
  if (value.includes('process') || value.includes('confirm')) return 'status-processing'
  return 'status-placed'
}

function getTrackingStep(status) {
  const value = String(status || '').toLowerCase()
  if (value.includes('cancel')) return -1
  if (value.includes('closed') || value.includes('deliver')) return 4
  if (value.includes('out')) return 3
  if (value.includes('ship')) return 2
  if (value.includes('process') || value.includes('confirm')) return 1
  return 0
}

function getReturnStatusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value.includes('refund') || value.includes('complete')) return 'return-status-success'
  if (value.includes('reject') || value.includes('cancel')) return 'return-status-rejected'
  if (value.includes('approve') || value.includes('received')) return 'return-status-approved'
  return 'return-status-pending'
}

function getOrderTotals(order) {
  const total = Number(order?.total_amount ?? order?.total ?? order?.amount ?? 0)
  const shipping = Number(order?.shipping ?? 0)
  const subtotal =
    order?.subtotal !== null && order?.subtotal !== undefined
      ? Number(order.subtotal)
      : Math.max(total - shipping, 0)

  return { subtotal, shipping, total }
}

// ============================================================
// TRACKING TIMELINE
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
          <span>This order is no longer being processed.</span>
        </div>
      </div>
    )
  }

  const steps = [
    {
      title: 'Order Placed',
      description: order?.created_at ? formatDate(order.created_at) : 'Order received',
      icon: Package,
    },
    {
      title: 'Order Confirmed',
      description: order?.confirmed_at ? formatDate(order.confirmed_at) : 'Being prepared',
      icon: Clock3,
    },
    {
      title: 'Shipped',
      description: order?.shipped_at ? formatDate(order.shipped_at) : 'Package on the way',
      icon: Truck,
    },
    {
      title: 'Out for Delivery',
      description: order?.out_for_delivery_at ? formatDate(order.out_for_delivery_at) : 'Arriving soon',
      icon: MapPin,
    },
    {
      title: 'Delivered',
      description: order?.delivered_at ? formatDate(order.delivered_at) : 'Order delivered',
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
            className={`tracking-step ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}
            key={step.title}
          >
            <div className="tracking-icon">
              <Icon size={18} />
            </div>
            <div className="tracking-content">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
            {index < steps.length - 1 && <div className="tracking-line" />}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [phoneInput, setPhoneInput] = useState('')

  // ==========================================================
  // FETCH ORDERS (TOKEN + PHONE)
  // ==========================================================

  const fetchOrders = async (manualPhone = null) => {
    try {
      setLoading(true)
      setError('')

      const customerToken = getCustomerOrderToken()
      const storedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY) || ''
      const phoneToUse = (manualPhone !== null ? manualPhone : storedPhone).trim()

      const queryParams = new URLSearchParams()
      if (phoneToUse) {
        queryParams.append('phone', phoneToUse)
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      console.log('📦 Fetching orders from:', `${API_BASE}/my-orders${queryString}`)

      const response = await fetch(`${API_BASE}/my-orders${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: getCustomerOrderHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to load your orders.')
      }

      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (err) {
      console.error('My Orders Error:', err)
      setError(err.message || 'Unable to load your orders.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handlePhoneSearch = e => {
    e.preventDefault()
    if (!phoneInput.trim()) return
    localStorage.setItem(CUSTOMER_PHONE_KEY, phoneInput.trim())
    fetchOrders(phoneInput.trim())
  }

  const toggleOrder = orderId => {
    setExpandedOrder(current => (current === orderId ? null : orderId))
  }

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="orders-loading">
            <SarikaLoader />
            <p>Please wait while we fetch your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        {/* HEADER */}
        <div className="my-orders-header">
          <div>
            <span className="orders-eyebrow">SARIKA FASHIONS</span>
            <h1>My Orders</h1>
            <p>View your order history, delivery tracking and details.</p>
          </div>

          <button
            type="button"
            className="refresh-orders-btn"
            onClick={() => {
              setRefreshing(true)
              fetchOrders()
            }}
            disabled={refreshing}
          >
            <RefreshCw size={17} className={refreshing ? 'refresh-spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="orders-error">
            <XCircle size={22} />
            <div>
              <strong>Unable to load orders</strong>
              <p>{error}</p>
              <button type="button" onClick={() => fetchOrders()}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE WITH QUICK PHONE SEARCH */}
        {!error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="empty-order-icon">
              <ShoppingBag size={42} />
            </div>
            <h2>No orders found</h2>
            <p>If you recently placed an order, enter your mobile number below to view it:</p>

            <form
              onSubmit={handlePhoneSearch}
              style={{
                display: 'flex',
                gap: '8px',
                maxWidth: '380px',
                margin: '16px auto',
                width: '100%',
              }}
            >
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                maxLength={10}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '15px',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                Search
              </button>
            </form>

            <Link to="/shop" className="shop-now-btn" style={{ marginTop: '16px' }}>
              Start Shopping
            </Link>
          </div>
        )}

        {/* ORDERS LIST */}
        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map(order => {
              const orderId = order.id || order.order_number
              const status = getOrderStatus(order)
              const paymentStatus = getPaymentStatus(order)
              const { subtotal, shipping, total } = getOrderTotals(order)
              const isExpanded = expandedOrder === orderId
              const customerReceived = isReceived(order)
              const orderClosed =
                customerReceived || String(status).toLowerCase() === 'closed'

              return (
                <article
                  className={`order-card ${orderClosed ? 'order-card-closed' : ''}`}
                  key={orderId}
                >
                  <div className="order-card-header">
                    <div className="order-main-info">
                      <div className="order-icon">
                        {orderClosed ? <CheckCircle2 size={21} /> : <Package size={21} />}
                      </div>
                      <div>
                        <span className="order-label">Order Number</span>
                        <h2>{order.order_number || `#${order.id}`}</h2>
                      </div>
                    </div>

                    <div className="order-date">
                      <span>Ordered on</span>
                      <strong>{formatDate(order.created_at)}</strong>
                      {formatTime(order.created_at) && (
                        <small>{formatTime(order.created_at)}</small>
                      )}
                    </div>
                  </div>

                  <div className="order-summary-grid">
                    <div className="order-summary-item">
                      <span>Order Status</span>
                      <strong className={`status-badge ${getStatusClass(status)}`}>
                        {orderClosed ? 'Closed' : status}
                      </strong>
                    </div>

                    <div className="order-summary-item">
                      <span>Payment</span>
                      <strong className="payment-badge payment-paid">
                        {paymentStatus}
                      </strong>
                    </div>

                    <div className="order-summary-item">
                      <span>Total Amount</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>

                  <div className="order-address-section">
                    <div className="address-heading">
                      <MapPin size={18} />
                      <strong>Delivery Address</strong>
                    </div>
                    <div className="address-content">
                      <strong>{order.customer_name || 'Customer'}</strong>
                      {order.customer_phone && <span>{order.customer_phone}</span>}
                      <p>
                        {order.address || order.address_line || ''}
                        {order.city && `, ${order.city}`}
                        {order.state && `, ${order.state}`}
                        {order.pincode && ` - ${order.pincode}`}
                      </p>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      type="button"
                      className="track-order-btn"
                      onClick={() => toggleOrder(orderId)}
                    >
                      <Truck size={17} />
                      {isExpanded ? 'Hide Details' : 'Track & View Details'}
                      {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="order-expanded">
                      <div className="expanded-section">
                        <h3><Truck size={19} /> Order Tracking</h3>
                        <TrackingTimeline order={order} />
                      </div>

                      <div className="expanded-section">
                        <h3><Package size={19} /> Items in this Order</h3>
                        <div className="order-items">
                          {Array.isArray(order.items) &&
                            order.items.map((item, index) => (
                              <div className="order-item" key={item.id || index}>
                                <div className="order-item-image">
                                  {getItemImage(item) ? (
                                    <img src={getItemImage(item)} alt={getItemName(item)} />
                                  ) : (
                                    <Package size={25} />
                                  )}
                                </div>
                                <div className="order-item-info">
                                  <strong>{getItemName(item)}</strong>
                                  <span>Qty: {getItemQuantity(item)}</span>
                                  <small>{money(getItemPrice(item))} each</small>
                                </div>
                                <strong>{money(getItemPrice(item) * getItemQuantity(item))}</strong>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="expanded-section">
                        <h3><CreditCard size={19} /> Payment & Summary</h3>
                        <div className="details-grid">
                          <div>
                            <span>Payment ID</span>
                            <strong>{order.razorpay_payment_id || 'Captured'}</strong>
                          </div>
                          <div>
                            <span>Total Paid</span>
                            <strong>{money(total)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}