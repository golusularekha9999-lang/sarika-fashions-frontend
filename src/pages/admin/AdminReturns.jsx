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
import '../MyOrders.css'

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api'
    : 'https://sarika-fashions-backend-rfwh.onrender.com/api')

const CUSTOMER_TOKEN_KEY = 'sarika_customer_order_token'
const CUSTOMER_PHONE_KEY = 'sarika_customer_phone'
const RETURN_REQUESTS_KEY = 'sarika_return_requests'

const RETURN_REASONS = [
  'Damaged / defective item',
  'Wrong item received',
  'Item does not match description',
  'Color / design is different',
  'Quality issue',
  'Size / fit issue',
  'Received a different product',
  'Changed my mind',
  'Other',
]

/* =========================================================
   HELPERS
========================================================= */

const getCustomerOrderToken = () => {
  return (
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    localStorage.getItem('customer_order_token') ||
    ''
  )
}

const getCustomerPhone = () => {
  return (
    localStorage.getItem(CUSTOMER_PHONE_KEY) ||
    localStorage.getItem('customer_phone') ||
    ''
  )
}

/*
 * NEW:
 * The backend can return the token inside each order
 * (customer_access_token). We read it from the order itself
 * so returns work even when localStorage is empty
 * (phone search, cleared storage, new device).
 */
const getOrderToken = (order) => {
  return (
    order?.customer_access_token ||
    order?.customerAccessToken ||
    order?.customer_order_token ||
    order?.access_token ||
    order?.accessToken ||
    ''
  )
}

/*
 * Send the customer token in both places because the backend
 * supports both Authorization and X-Customer-Order-Token.
 */
const buildTokenHeaders = (token) => {
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'X-Customer-Order-Token': token,
      }
    : {}
}

const getCustomerOrderHeaders = () => {
  return buildTokenHeaders(getCustomerOrderToken())
}

const getStoredReturnRequests = () => {
  try {
    const stored = localStorage.getItem(RETURN_REQUESTS_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to read return requests:', error)
    return []
  }
}

const saveStoredReturnRequests = (requests) => {
  try {
    localStorage.setItem(RETURN_REQUESTS_KEY, JSON.stringify(requests))
  } catch (error) {
    console.error('Failed to save return requests:', error)
  }
}

const formatDate = (dateValue) => {
  if (!dateValue) return '—'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (dateValue) => {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const money = (value) => {
  const amount = Number(value || 0)

  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

const getOrderId = (order) => {
  return order?.id || order?._id || order?.order_id || order?.orderId || ''
}

const getOrderNumber = (order) => {
  return (
    order?.order_number ||
    order?.orderNumber ||
    order?.order_no ||
    order?.orderNo ||
    order?.id ||
    order?._id ||
    'Order'
  )
}

const getOrderDate = (order) => {
  return (
    order?.created_at ||
    order?.createdAt ||
    order?.order_date ||
    order?.orderDate ||
    order?.date ||
    ''
  )
}

const getOrderStatus = (order) => {
  return String(
    order?.status || order?.order_status || order?.orderStatus || 'Pending'
  )
}

const getPaymentStatus = (order) => {
  return String(
    order?.payment_status ||
      order?.paymentStatus ||
      order?.payment?.status ||
      'Pending'
  )
}

const getItemName = (item) => {
  return (
    item?.product_name ||
    item?.productName ||
    item?.name ||
    item?.title ||
    item?.product?.name ||
    'Saree'
  )
}

const getItemPrice = (item) => {
  return Number(
    item?.price ?? item?.unit_price ?? item?.unitPrice ?? item?.product?.price ?? 0
  )
}

const getItemQuantity = (item) => {
  return Number(item?.quantity ?? item?.qty ?? 1)
}

const getItemImage = (item) => {
  return (
    item?.image_url ||
    item?.imageUrl ||
    item?.image ||
    item?.product_image ||
    item?.productImage ||
    item?.product?.image_url ||
    item?.product?.image ||
    ''
  )
}

const getOrderItems = (order) => {
  const items =
    order?.items || order?.order_items || order?.orderItems || order?.products || []

  return Array.isArray(items) ? items : []
}

const getItemKey = (item, index) => {
  return item?.id || item?._id || item?.item_id || item?.product_id || index
}

const isReceived = (order) => {
  const status = getOrderStatus(order).toLowerCase()

  return (
    status.includes('deliver') ||
    status.includes('completed') ||
    status.includes('closed') ||
    order?.delivered === true ||
    order?.is_delivered === true ||
    order?.isDelivered === true
  )
}

const isOrderDelivered = (order) => {
  return isReceived(order)
}

const getStatusClass = (status) => {
  const value = String(status || '').toLowerCase()

  if (
    value.includes('deliver') ||
    value.includes('complete') ||
    value.includes('success')
  ) {
    return 'status-delivered'
  }

  if (value.includes('cancel') || value.includes('reject')) {
    return 'status-cancelled'
  }

  if (value.includes('ship') || value.includes('process')) {
    return 'status-processing'
  }

  return 'status-pending'
}

const getTrackingStep = (order) => {
  const status = getOrderStatus(order).toLowerCase()

  if (status.includes('cancel') || status.includes('reject')) return -1
  if (status.includes('deliver') || status.includes('complete')) return 4
  if (status.includes('ship')) return 3
  if (status.includes('process') || status.includes('packed')) return 2
  if (status.includes('confirm') || status.includes('accept')) return 1

  return 0
}

const getReturnStatusClass = (status) => {
  const value = String(status || '').toLowerCase()

  if (value === 'approved') return 'return-approved'
  if (value === 'rejected') return 'return-rejected'

  return 'return-pending'
}

const getOrderTotals = (order) => {
  const items = getOrderItems(order)

  const calculatedSubtotal = items.reduce((total, item) => {
    return total + getItemPrice(item) * getItemQuantity(item)
  }, 0)

  const subtotal = Number(
    order?.subtotal ?? order?.sub_total ?? order?.subTotal ?? calculatedSubtotal
  )

  const shipping = Number(
    order?.shipping ?? order?.shipping_fee ?? order?.shippingFee ?? 0
  )

  const tax = Number(order?.tax ?? order?.gst ?? 0)

  const discount = Number(order?.discount ?? 0)

  const total = Number(
    order?.total ??
      order?.grand_total ??
      order?.grandTotal ??
      subtotal + shipping + tax - discount
  )

  return { subtotal, shipping, tax, discount, total }
}

/* =========================================================
   TRACKING
========================================================= */

const TrackingTimeline = ({ order }) => {
  const currentStep = getTrackingStep(order)

  if (currentStep === -1) {
    return (
      <div className="tracking-cancelled">
        <XCircle size={20} />

        <div>
          <strong>Order Cancelled</strong>
          <span>This order has been cancelled.</span>
        </div>
      </div>
    )
  }

  const steps = [
    { label: 'Order Placed', icon: ShoppingBag },
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Processing', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: MapPin },
  ]

  return (
    <div className="tracking-timeline">
      {steps.map((step, index) => {
        const Icon = step.icon

        const active = index <= currentStep
        const completed = index < currentStep

        return (
          <React.Fragment key={step.label}>
            <div
              className={`tracking-step ${active ? 'active' : ''} ${
                completed ? 'completed' : ''
              }`}
            >
              <div className="tracking-icon">
                <Icon size={17} />
              </div>

              <span>{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`tracking-line ${index < currentStep ? 'active' : ''}`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [expandedOrder, setExpandedOrder] = useState(null)

  const [phoneInput, setPhoneInput] = useState(getCustomerPhone())

  const [returnRequests, setReturnRequests] = useState([])

  const [returnModalOrder, setReturnModalOrder] = useState(null)

  const [returnForm, setReturnForm] = useState({
    itemId: '',
    reason: '',
    description: '',
    evidence: null,
  })

  const [returnPreview, setReturnPreview] = useState('')
  const [returnError, setReturnError] = useState('')
  const [returnSubmitting, setReturnSubmitting] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState('')

  /* =========================================================
     LOAD LOCAL RETURN REQUESTS
  ========================================================= */

  useEffect(() => {
    setReturnRequests(getStoredReturnRequests())
  }, [])

  /* =========================================================
     FETCH ORDERS
  ========================================================= */

  const fetchOrders = async (manualPhone = null) => {
    const storedPhone = getCustomerPhone()
    const customerToken = getCustomerOrderToken()

    const phone = (manualPhone !== null ? manualPhone : storedPhone).trim()

    /*
     * We can fetch orders using either:
     * 1. phone number
     * 2. customer order token
     */
    if (!phone && !customerToken) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setError('')

      if (manualPhone !== null) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      let url = `${API_BASE}/my-orders`

      if (phone) {
        url += `?phone=${encodeURIComponent(phone)}`
      }

      console.log('📦 Fetching orders from:', url)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...getCustomerOrderHeaders(),
        },
      })

      if (!response.ok) {
        const text = await response.text()

        let message = text

        try {
          const errorData = JSON.parse(text)

          message = errorData?.error || errorData?.message || text
        } catch {
          // Keep text response
        }

        throw new Error(
          message || `Request failed with status ${response.status}`
        )
      }

      const data = await response.json()

      let receivedOrders = []

      if (Array.isArray(data)) {
        receivedOrders = data
      } else if (Array.isArray(data?.orders)) {
        receivedOrders = data.orders
      } else if (Array.isArray(data?.data)) {
        receivedOrders = data.data
      }

      /*
       * NEW:
       * If the backend sent a token (top-level or inside an order)
       * and we don't have one stored yet, save it so the return
       * form works even after a phone search.
       */
      const tokenFromResponse =
        data?.customer_access_token ||
        data?.customer_order_token ||
        data?.token ||
        receivedOrders.map(getOrderToken).find(Boolean) ||
        ''

      if (tokenFromResponse && !getCustomerOrderToken()) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, tokenFromResponse)
      }

      setOrders(receivedOrders)
    } catch (err) {
      console.error('My Orders Error:', err)

      if (err?.message?.toLowerCase().includes('failed to fetch')) {
        setError(
          'Unable to connect to the orders server. Please make sure your backend is running.'
        )
      } else {
        setError(
          err?.message || 'Unable to load your orders. Please try again.'
        )
      }

      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const phone = getCustomerPhone()
    const token = getCustomerOrderToken()

    if (phone || token) {
      fetchOrders()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* =========================================================
     PHONE SEARCH
  ========================================================= */

  const handlePhoneSearch = (event) => {
    event.preventDefault()

    const phone = phoneInput.trim()

    if (!phone) {
      setError('Please enter your phone number.')
      return
    }

    localStorage.setItem(CUSTOMER_PHONE_KEY, phone)

    fetchOrders(phone)
  }

  /* =========================================================
     ORDER ACTIONS
  ========================================================= */

  const toggleOrder = (orderId) => {
    setExpandedOrder((current) => (current === orderId ? null : orderId))
  }

  /* =========================================================
     RETURN HELPERS
  ========================================================= */

  const getReturnsForOrder = (orderId) => {
    return returnRequests.filter(
      (request) => String(request.orderId) === String(orderId)
    )
  }

  const hasReturnedItem = (orderId, itemId) => {
    return returnRequests.some(
      (request) =>
        String(request.orderId) === String(orderId) &&
        String(request.itemId) === String(itemId)
    )
  }

  const openReturnModal = (order) => {
    const items = getOrderItems(order)

    const availableItem =
      items.find(
        (item, index) =>
          !hasReturnedItem(getOrderId(order), getItemKey(item, index))
      ) || items[0]

    const availableIndex = availableItem ? items.indexOf(availableItem) : 0

    const availableItemId = getItemKey(availableItem, availableIndex)

    setReturnModalOrder(order)

    setReturnForm({
      itemId: String(availableItemId),
      reason: '',
      description: '',
      evidence: null,
    })

    setReturnPreview('')
    setReturnError('')
    setReturnSuccess('')
  }

  const closeReturnModal = () => {
    if (returnSubmitting) return

    setReturnModalOrder(null)

    setReturnForm({
      itemId: '',
      reason: '',
      description: '',
      evidence: null,
    })

    setReturnPreview('')
    setReturnError('')
    setReturnSubmitting(false)
  }

  const handleReturnFieldChange = (event) => {
    const { name, value } = event.target

    setReturnForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setReturnError('')
  }

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setReturnError('Please upload an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setReturnError('Image size must be less than 5 MB.')
      return
    }

    setReturnForm((previous) => ({
      ...previous,
      evidence: file,
    }))

    setReturnError('')

    const reader = new FileReader()

    reader.onloadend = () => {
      setReturnPreview(reader.result)
    }

    reader.readAsDataURL(file)
  }

  /* =========================================================
     SUBMIT RETURN REQUEST

     Sends the request to the Flask backend:
       POST /api/returns

     FIX: the customer token is now taken from
       1. the order itself (customer_access_token), or
       2. localStorage
     so the request is no longer blocked on the frontend.
  ========================================================= */

  const submitReturnRequest = async (event) => {
    event.preventDefault()

    if (!returnModalOrder) return

    const items = getOrderItems(returnModalOrder)

    const selectedIndex = items.findIndex(
      (item, index) =>
        String(getItemKey(item, index)) === String(returnForm.itemId)
    )

    const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : null

    if (!selectedItem) {
      setReturnError('Please select the item you want to return.')
      return
    }

    if (!returnForm.reason) {
      setReturnError('Please select a return reason.')
      return
    }

    if (!returnForm.description.trim()) {
      setReturnError('Please describe the issue with the item.')
      return
    }

    const orderId = getOrderId(returnModalOrder)

    const itemId = getItemKey(selectedItem, selectedIndex)

    if (!orderId) {
      setReturnError(
        'Unable to identify this order. Please refresh your orders and try again.'
      )
      return
    }

    if (hasReturnedItem(orderId, itemId)) {
      setReturnError('A return request already exists for this item.')
      return
    }

    /*
     * FIX: order token first, then localStorage.
     */
    const customerToken =
      getOrderToken(returnModalOrder) || getCustomerOrderToken()

    if (!customerToken) {
      setReturnError(
        'We could not verify this order. Please search your orders again with your phone number, then try the return again.'
      )
      return
    }

    // Keep it stored for next time
    if (!getCustomerOrderToken()) {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, customerToken)
    }

    try {
      setReturnSubmitting(true)
      setReturnError('')
      setReturnSuccess('')

      const productId =
        selectedItem?.product_id ??
        selectedItem?.productId ??
        selectedItem?.product?.id ??
        selectedItem?.product?._id ??
        selectedItem?.id ??
        null

      const orderNumber = getOrderNumber(returnModalOrder)

      const requestBody = {
        order_id: orderId,
        order_number: orderNumber,
        product_id: productId,
        product_name: getItemName(selectedItem),
        quantity: getItemQuantity(selectedItem),
        reason: returnForm.reason,
        description: returnForm.description.trim(),
      }

      console.log('↩️ Submitting return request:', requestBody)

      const response = await fetch(`${API_BASE}/returns`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...buildTokenHeaders(customerToken),
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()

      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = { message: responseText }
      }

      console.log('↩️ Return API response:', response.status, data)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Return request failed with status ${response.status}`
        )
      }

      /*
       * Backend saved the return. Keep a local copy only for
       * immediate display inside My Orders.
       */
      const request = {
        id: data?.return_id || data?.id || `RET-${Date.now()}`,
        orderId,
        orderNumber,
        itemId: String(itemId),
        itemName: getItemName(selectedItem),
        itemImage: getItemImage(selectedItem),
        itemPrice: getItemPrice(selectedItem),
        quantity: getItemQuantity(selectedItem),
        reason: returnForm.reason,
        description: returnForm.description.trim(),
        evidenceName: returnForm.evidence?.name || '',
        status: data?.return_status || data?.status || 'Return Requested',
        requestedAt: data?.requested_at || new Date().toISOString(),
        backendSaved: true,
      }

      const updatedRequests = [...returnRequests, request]

      setReturnRequests(updatedRequests)

      saveStoredReturnRequests(updatedRequests)

      setReturnSuccess(
        `Return request submitted successfully for ${getItemName(selectedItem)}.`
      )

      setReturnModalOrder(null)

      setReturnForm({
        itemId: '',
        reason: '',
        description: '',
        evidence: null,
      })

      setReturnPreview('')

      await fetchOrders()
    } catch (err) {
      console.error('Return request error:', err)

      setReturnError(
        err?.message ||
          'Unable to submit the return request. Please try again.'
      )
    } finally {
      setReturnSubmitting(false)
    }
  }

  const getReturnStatusForOrder = (orderId) => {
    const requests = getReturnsForOrder(orderId)

    if (!requests.length) return null

    return requests[requests.length - 1]
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>

          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        {/* HEADER */}

        <div className="orders-page-header">
          <div>
            <span className="orders-eyebrow">SARIKA FASHIONS</span>

            <h1>My Orders</h1>

            <p>Track your saree orders and manage your purchases.</p>
          </div>

          <button
            type="button"
            className={`refresh-orders-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={() => fetchOrders()}
            disabled={refreshing}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* SUCCESS */}

        {returnSuccess && (
          <div className="orders-alert orders-alert-success">
            <CheckCircle2 size={18} />

            <span>{returnSuccess}</span>

            <button type="button" onClick={() => setReturnSuccess('')}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="orders-alert orders-alert-error">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button type="button" onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* PHONE SEARCH */}

        {!orders.length && (
          <div className="orders-search-card">
            <div className="orders-search-icon">
              <Search size={24} />
            </div>

            <div className="orders-search-content">
              <h2>Find Your Orders</h2>

              <p>Enter the phone number used while placing your order.</p>

              <form className="orders-search-form" onSubmit={handlePhoneSearch}>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="Enter phone number"
                  maxLength={15}
                />

                <button type="submit">
                  <Search size={17} />
                  Find Orders
                </button>
              </form>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}

        {!orders.length && !error && (
          <div className="orders-empty">
            <div className="empty-bag">
              <ShoppingBag size={44} />
            </div>

            <h2>No orders found</h2>

            <p>We couldn't find any orders for this phone number.</p>

            <Link to="/shop" className="shop-now-btn">
              Continue Shopping
            </Link>
          </div>
        )}

        {/* ORDER LIST */}

        {orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order, orderIndex) => {
              const orderId = getOrderId(order) || `order-${orderIndex}`

              const orderNumber = getOrderNumber(order)
              const orderStatus = getOrderStatus(order)
              const paymentStatus = getPaymentStatus(order)
              const items = getOrderItems(order)
              const totals = getOrderTotals(order)

              const isExpanded = expandedOrder === orderId

              const orderReturns = getReturnsForOrder(orderId)
              const latestReturn = getReturnStatusForOrder(orderId)

              return (
                <article
                  className={`order-card ${
                    isExpanded ? 'order-card-expanded' : ''
                  }`}
                  key={orderId}
                >
                  {/* ORDER HEADER */}

                  <button
                    type="button"
                    className="order-card-header"
                    onClick={() => toggleOrder(orderId)}
                  >
                    <div className="order-header-left">
                      <div className="order-icon">
                        <Package size={20} />
                      </div>

                      <div>
                        <span className="order-label">ORDER</span>

                        <h2>#{orderNumber}</h2>

                        <p>
                          {formatDate(getOrderDate(order))}

                          {getOrderDate(order) &&
                            formatTime(getOrderDate(order)) && (
                              <>
                                {' • '}
                                {formatTime(getOrderDate(order))}
                              </>
                            )}
                        </p>
                      </div>
                    </div>

                    <div className="order-header-right">
                      <span
                        className={`order-status ${getStatusClass(orderStatus)}`}
                      >
                        {orderStatus}
                      </span>

                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </button>

                  {/* SUMMARY */}

                  <div className="order-summary">
                    <div>
                      <span>Items</span>
                      <strong>{items.length}</strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>{money(totals.total)}</strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong>{paymentStatus}</strong>
                    </div>
                  </div>

                  {/* DELIVERY ADDRESS */}

                  {(order?.address ||
                    order?.shipping_address ||
                    order?.shippingAddress) && (
                    <div className="delivery-address">
                      <div className="section-icon">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <span className="section-label">DELIVERY ADDRESS</span>

                        <p>
                          {order?.address ||
                            order?.shipping_address ||
                            order?.shippingAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="order-actions">
                    <button
                      type="button"
                      className="view-order-btn"
                      onClick={() => toggleOrder(orderId)}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}

                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {isOrderDelivered(order) &&
                      (orderReturns.length > 0 ? (
                        <button
                          type="button"
                          className="return-requested-btn"
                          onClick={() => toggleOrder(orderId)}
                        >
                          <Check size={16} />
                          Return Requested
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="return-item-btn"
                          onClick={() => openReturnModal(order)}
                        >
                          <RotateCcw size={16} />
                          Return Item
                        </button>
                      ))}
                  </div>

                  {/* RETURN STATUS */}

                  {latestReturn && (
                    <div
                      className={`return-status-card ${getReturnStatusClass(
                        latestReturn.status
                      )}`}
                    >
                      <div className="return-status-icon">
                        {String(latestReturn.status).toLowerCase() ===
                        'approved' ? (
                          <CheckCircle2 size={19} />
                        ) : String(latestReturn.status).toLowerCase() ===
                          'rejected' ? (
                          <XCircle size={19} />
                        ) : (
                          <Clock3 size={19} />
                        )}
                      </div>

                      <div className="return-status-content">
                        <div className="return-status-heading">
                          <strong>Return Request</strong>

                          <span>{latestReturn.status}</span>
                        </div>

                        <p>{latestReturn.itemName}</p>

                        <small>
                          Requested on {formatDate(latestReturn.requestedAt)}
                        </small>
                      </div>
                    </div>
                  )}

                  {/* EXPANDED DETAILS */}

                  {isExpanded && (
                    <div className="order-details">
                      {/* TRACKING */}

                      <section className="order-section">
                        <div className="section-heading">
                          <div>
                            <span className="section-label">ORDER TRACKING</span>

                            <h3>Track your delivery</h3>
                          </div>

                          <Truck size={22} />
                        </div>

                        <TrackingTimeline order={order} />
                      </section>

                      {/* PRODUCTS */}

                      <section className="order-section">
                        <div className="section-heading">
                          <div>
                            <span className="section-label">PRODUCTS</span>

                            <h3>Items in this order</h3>
                          </div>

                          <ShoppingBag size={22} />
                        </div>

                        <div className="order-products">
                          {items.length === 0 ? (
                            <div className="no-items">
                              No product details available.
                            </div>
                          ) : (
                            items.map((item, itemIndex) => {
                              const itemId = getItemKey(item, itemIndex)

                              const returned = hasReturnedItem(orderId, itemId)

                              return (
                                <div
                                  className="order-product"
                                  key={`${orderId}-${itemId}`}
                                >
                                  <div className="product-image-wrap">
                                    {getItemImage(item) ? (
                                      <img
                                        src={getItemImage(item)}
                                        alt={getItemName(item)}
                                      />
                                    ) : (
                                      <div className="product-image-placeholder">
                                        <ShoppingBag size={25} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="product-info">
                                    <h4>{getItemName(item)}</h4>

                                    <p>Qty: {getItemQuantity(item)}</p>

                                    {returned && (
                                      <span className="returned-badge">
                                        <Check size={13} />
                                        Return Requested
                                      </span>
                                    )}
                                  </div>

                                  <strong className="product-price">
                                    {money(
                                      getItemPrice(item) * getItemQuantity(item)
                                    )}
                                  </strong>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </section>

                      {/* PAYMENT SUMMARY */}

                      <section className="order-section">
                        <div className="section-heading">
                          <div>
                            <span className="section-label">PAYMENT</span>

                            <h3>Payment summary</h3>
                          </div>

                          <CreditCard size={22} />
                        </div>

                        <div className="payment-summary">
                          <div>
                            <span>Subtotal</span>
                            <strong>{money(totals.subtotal)}</strong>
                          </div>

                          <div>
                            <span>Shipping</span>
                            <strong>
                              {totals.shipping === 0
                                ? 'FREE'
                                : money(totals.shipping)}
                            </strong>
                          </div>

                          {totals.tax > 0 && (
                            <div>
                              <span>Tax</span>
                              <strong>{money(totals.tax)}</strong>
                            </div>
                          )}

                          {totals.discount > 0 && (
                            <div className="discount-row">
                              <span>Discount</span>
                              <strong>-{money(totals.discount)}</strong>
                            </div>
                          )}

                          <div className="payment-total">
                            <span>Total Paid</span>
                            <strong>{money(totals.total)}</strong>
                          </div>
                        </div>

                        <div className="payment-method">
                          <LockKeyhole size={16} />

                          <span>
                            Payment Status: <strong>{paymentStatus}</strong>
                          </span>
                        </div>
                      </section>

                      {/* RETURN BUTTON INSIDE DETAILS */}

                      {isOrderDelivered(order) && orderReturns.length === 0 && (
                        <button
                          type="button"
                          className="large-return-btn"
                          onClick={() => openReturnModal(order)}
                        >
                          <RotateCcw size={18} />
                          Request Return
                        </button>
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

      {returnModalOrder && (
        <div
          className="return-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReturnModal()
            }
          }}
        >
          <div className="return-modal">
            <div className="return-modal-header">
              <div>
                <span className="section-label">RETURN ITEM</span>

                <h2>Request a return</h2>

                <p>Order #{getOrderNumber(returnModalOrder)}</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeReturnModal}
                disabled={returnSubmitting}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={submitReturnRequest} className="return-form">
              {/* PRODUCT SELECT */}

              <div className="return-form-group">
                <label>Select item</label>

                <div className="return-product-list">
                  {getOrderItems(returnModalOrder).map((item, index) => {
                    const itemId = getItemKey(item, index)

                    const selected = String(returnForm.itemId) === String(itemId)

                    const returned = hasReturnedItem(
                      getOrderId(returnModalOrder),
                      itemId
                    )

                    return (
                      <button
                        type="button"
                        key={String(itemId)}
                        className={`return-product-option ${
                          selected ? 'selected' : ''
                        } ${returned ? 'already-returned' : ''}`}
                        onClick={() => {
                          if (returned) return

                          setReturnForm((previous) => ({
                            ...previous,
                            itemId: String(itemId),
                          }))

                          setReturnError('')
                        }}
                        disabled={returned}
                      >
                        <div className="return-product-image">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={getItemName(item)}
                            />
                          ) : (
                            <ShoppingBag size={22} />
                          )}
                        </div>

                        <div className="return-product-details">
                          <strong>{getItemName(item)}</strong>

                          <span>Qty: {getItemQuantity(item)}</span>

                          {returned && <small>Already requested</small>}
                        </div>

                        <div className="return-radio">
                          {selected && <Check size={14} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* REASON */}

              <div className="return-form-group">
                <label htmlFor="return-reason">Reason for return</label>

                <select
                  id="return-reason"
                  name="reason"
                  value={returnForm.reason}
                  onChange={handleReturnFieldChange}
                >
                  <option value="">Select a reason</option>

                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="return-form-group">
                <label htmlFor="return-description">Describe the issue</label>

                <textarea
                  id="return-description"
                  name="description"
                  value={returnForm.description}
                  onChange={handleReturnFieldChange}
                  placeholder="Please tell us what went wrong with the item..."
                  rows={4}
                  maxLength={500}
                />

                <span className="character-count">
                  {returnForm.description.length}/500
                </span>
              </div>

              {/* EVIDENCE */}

              <div className="return-form-group">
                <label>
                  Add photo evidence <span>(optional)</span>
                </label>

                <label htmlFor="return-evidence" className="evidence-upload">
                  <Send size={20} />

                  <div>
                    <strong>Upload an image</strong>

                    <span>JPG, PNG or WEBP • Max 5 MB</span>
                  </div>

                  <input
                    id="return-evidence"
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceChange}
                  />
                </label>

                {returnPreview && (
                  <div className="evidence-preview">
                    <img src={returnPreview} alt="Return evidence preview" />

                    <button
                      type="button"
                      onClick={() => {
                        setReturnPreview('')

                        setReturnForm((previous) => ({
                          ...previous,
                          evidence: null,
                        }))
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* INFO */}

              <div className="return-info-box">
                <AlertCircle size={18} />

                <p>
                  Your return request will be reviewed by our team. Keep the
                  product unused and in its original packaging where possible.
                </p>
              </div>

              {/* ERROR */}

              {returnError && (
                <div className="return-form-error">
                  <AlertCircle size={17} />

                  <span>{returnError}</span>
                </div>
              )}

              {/* ACTIONS */}

              <div className="return-modal-actions">
                <button
                  type="button"
                  className="cancel-return-btn"
                  onClick={closeReturnModal}
                  disabled={returnSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-return-btn"
                  disabled={returnSubmitting}
                >
                  {returnSubmitting ? (
                    <>
                      <span className="button-spinner" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={17} />
                      Submit Return Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders