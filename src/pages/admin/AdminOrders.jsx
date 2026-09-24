import React, {
  useEffect,
  useState,
} from 'react'

import OrderTable from '../../components/OrderTable.jsx'
import Modal from '../../components/Modal.jsx'

import { API_BASE } from '../../context/AdminAuthContext.jsx'

const STATUS_FLOW = [
  'Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

function getStatusColor(status) {
  const value =
    String(status || '').toLowerCase()

  if (value.includes('closed')) {
    return {
      background: '#f3e8ff',
      color: '#6b21a8',
    }
  }

  if (value.includes('deliver')) {
    return {
      background: '#e8f7ee',
      color: '#18794e',
    }
  }

  if (value.includes('out')) {
    return {
      background: '#fff4df',
      color: '#a05a00',
    }
  }

  if (value.includes('ship')) {
    return {
      background: '#e8f1ff',
      color: '#2457a6',
    }
  }

  if (
    value.includes('confirm') ||
    value.includes('process')
  ) {
    return {
      background: '#fff4df',
      color: '#9a6200',
    }
  }

  if (value.includes('cancel')) {
    return {
      background: '#ffe9e9',
      color: '#c62828',
    }
  }

  return {
    background: '#f1f1f1',
    color: '#555',
  }
}

function getNextAction(status) {
  switch (status) {
    case 'Placed':
      return {
        label: 'Confirm Order',
        next: 'Confirmed',
      }

    case 'Confirmed':
      return {
        label: 'Mark Shipped',
        next: 'Shipped',
      }

    case 'Shipped':
      return {
        label: 'Out for Delivery',
        next: 'Out for Delivery',
      }

    case 'Out for Delivery':
      return {
        label: 'Mark Delivered',
        next: 'Delivered',
      }

    default:
      return null
  }
}

export default function AdminOrders() {

  const [orders, setOrders] =
    useState([])

  const [selectedOrder, setSelectedOrder] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [updatingId, setUpdatingId] =
    useState(null)

  const [statusMessage, setStatusMessage] =
    useState('')

  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  const fetchOrders = async () => {

    try {

      setLoading(true)
      setError('')

      console.log(
        '📦 FETCHING ORDERS:',
        `${API_BASE}/orders`
      )

      const response =
        await fetch(
          `${API_BASE}/orders`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept:
                'application/json',
            },
          }
        )

      const data =
        await response
          .json()
          .catch(() => ({}))

      console.log(
        '📦 ORDERS RESPONSE:',
        response.status,
        data
      )

      if (response.status === 401) {

        setOrders([])

        setError(
          'Admin session expired. Please login again.'
        )

        return
      }

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to fetch orders'
        )
      }

      const orderList =
        Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data)
            ? data
            : []

      console.log(
        `✅ ${orderList.length} orders loaded`
      )

      setOrders(orderList)

    } catch (error) {

      console.error(
        '❌ FETCH ORDERS ERROR:',
        error
      )

      setOrders([])

      setError(
        error.message ||
        'Unable to load orders.'
      )

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // ==========================================================
  // UPDATE ORDER STATUS
  // ==========================================================

  const updateOrderStatus = async (
    order,
    newStatus
  ) => {

    if (!order?.id) {
      alert(
        'Order ID is missing.'
      )
      return
    }

    const orderNumber =
      order.order_number ||
      `#${order.id}`

    let confirmationMessage =
      `Change ${orderNumber} to "${newStatus}"?`

    if (
      newStatus === 'Confirmed'
    ) {
      confirmationMessage =
        `Confirm ${orderNumber}?\n\nThis tells the customer that their order has been accepted and is being prepared.`
    }

    if (
      newStatus === 'Shipped'
    ) {
      confirmationMessage =
        `Mark ${orderNumber} as Shipped?`
    }

    if (
      newStatus === 'Out for Delivery'
    ) {
      confirmationMessage =
        `Mark ${orderNumber} as Out for Delivery?`
    }

    if (
      newStatus === 'Delivered'
    ) {
      confirmationMessage =
        `Mark ${orderNumber} as Delivered?\n\nThe customer will then be able to confirm that they received the order.`
    }

    if (
      !window.confirm(
        confirmationMessage
      )
    ) {
      return
    }

    try {

      setUpdatingId(order.id)
      setStatusMessage('')

      const response =
        await fetch(
          `${API_BASE}/orders/${order.id}/status`,
          {
            method: 'PUT',

            credentials: 'include',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify({
              order_status:
                newStatus,
            }),
          }
        )

      const data =
        await response
          .json()
          .catch(() => ({}))

      console.log(
        '📦 STATUS UPDATE:',
        response.status,
        data
      )

      if (response.status === 401) {

        throw new Error(
          'Admin session expired. Please login again.'
        )
      }

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to update order status.'
        )
      }

      const updatedOrder =
        data.order

      setOrders(
        current =>
          current.map(
            item =>
              item.id === order.id
                ? (
                    updatedOrder ||
                    {
                      ...item,
                      order_status:
                        newStatus,
                    }
                  )
                : item
          )
      )

      if (
        selectedOrder?.id ===
        order.id
      ) {

        setSelectedOrder(
          updatedOrder ||
          {
            ...selectedOrder,
            order_status:
              newStatus,
          }
        )
      }

      setStatusMessage(
        `${orderNumber} is now "${newStatus}".`
      )

      setTimeout(() => {
        setStatusMessage('')
      }, 4000)

    } catch (error) {

      console.error(
        '❌ STATUS UPDATE ERROR:',
        error
      )

      alert(
        error.message ||
        'Unable to update order status.'
      )

    } finally {

      setUpdatingId(null)
    }
  }

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return 'N/A'
    }

    try {

      return new Date(
        date
      ).toLocaleString(
        'en-IN'
      )

    } catch {

      return date
    }
  }

  // ==========================================================
  // ORDER DETAILS
  // ==========================================================

  const renderOrderDetails = () => {

    if (!selectedOrder) {
      return null
    }

    const status =
      selectedOrder.order_status ||
      selectedOrder.status ||
      'Placed'

    const nextAction =
      getNextAction(status)

    const customerReceived =
      Number(
        selectedOrder.customer_received
      ) === 1

    return (
      <div
        style={{
          fontSize:
            '0.9rem',
          lineHeight:
            1.8,
        }}
      >

        {/* ================================================
            STATUS CONTROL
        ================================================ */}

        <div
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 14,
            background: '#fff8fb',
            border:
              '1px solid #f0d5e2',
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              gap: 12,
              flexWrap:
                'wrap',
            }}
          >

            <div>

              <div
                style={{
                  fontSize: 12,
                  color: '#777',
                  marginBottom: 5,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                  fontWeight: 700,
                }}
              >
                Current Order Status
              </div>

              <span
                style={{
                  display:
                    'inline-flex',
                  alignItems:
                    'center',
                  padding:
                    '7px 13px',
                  borderRadius:
                    999,
                  fontWeight: 700,
                  fontSize: 13,
                  ...getStatusColor(
                    customerReceived
                      ? 'Closed'
                      : status
                  ),
                }}
              >
                {customerReceived
                  ? 'Closed'
                  : status}
              </span>

            </div>

            {customerReceived && (

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: 7,
                  color:
                    '#6b21a8',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                🔒 Customer received
              </div>

            )}

          </div>

          {/* STATUS FLOW */}

          <div
            style={{
              marginTop: 18,
              display:
                'grid',
              gridTemplateColumns:
                'repeat(5, minmax(0, 1fr))',
              gap: 6,
            }}
          >

            {STATUS_FLOW.map(
              (step, index) => {

                const currentIndex =
                  STATUS_FLOW.indexOf(
                    status
                  )

                const completed =
                  currentIndex >=
                  index

                return (
                  <div
                    key={step}
                    style={{
                      textAlign:
                        'center',
                    }}
                  >

                    <div
                      style={{
                        height: 5,
                        borderRadius:
                          999,
                        background:
                          completed
                            ? '#8e1748'
                            : '#e6e6e6',
                        marginBottom:
                          6,
                      }}
                    />

                    <span
                      style={{
                        fontSize: 10,
                        color:
                          completed
                            ? '#8e1748'
                            : '#999',
                        fontWeight:
                          completed
                            ? 700
                            : 500,
                      }}
                    >
                      {step}
                    </span>

                  </div>
                )
              }
            )}

          </div>

          {/* NEXT ACTION */}

          {nextAction &&
            !customerReceived && (

              <button
                type="button"
                onClick={() =>
                  updateOrderStatus(
                    selectedOrder,
                    nextAction.next
                  )
                }
                disabled={
                  updatingId ===
                  selectedOrder.id
                }
                style={{
                  width: '100%',
                  marginTop: 18,
                  padding:
                    '12px 16px',
                  border: 'none',
                  borderRadius: 9,
                  background:
                    '#8e1748',
                  color: '#fff',
                  fontWeight: 700,
                  cursor:
                    updatingId ===
                    selectedOrder.id
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    updatingId ===
                    selectedOrder.id
                      ? 0.6
                      : 1,
                }}
              >
                {updatingId ===
                selectedOrder.id
                  ? 'Updating...'
                  : nextAction.label}
              </button>

            )}

          {status ===
            'Delivered' &&
            !customerReceived && (

              <p
                style={{
                  margin:
                    '10px 0 0',
                  fontSize: 12,
                  color: '#777',
                  textAlign:
                    'center',
                }}
              >
                The customer can now click
                “I Received My Order”.
              </p>

            )}

          {customerReceived && (

            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 9,
                background:
                  '#f7f0ff',
                color:
                  '#6b21a8',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ✓ Customer confirmed receipt.
              This order is permanently marked
              as Closed.
            </div>

          )}

        </div>

        {/* ================================================
            CUSTOMER
        ================================================ */}

        <p>
          <strong>
            Customer:
          </strong>{' '}
          {selectedOrder.customer_name ||
            selectedOrder.customer ||
            'N/A'}
        </p>

        <p>
          <strong>
            Email:
          </strong>{' '}
          {selectedOrder.customer_email ||
            selectedOrder.email ||
            'N/A'}
        </p>

        <p>
          <strong>
            Phone:
          </strong>{' '}
          {selectedOrder.customer_phone ||
            selectedOrder.phone ||
            'N/A'}
        </p>

        {/* ================================================
            ADDRESS
        ================================================ */}

        <p>
          <strong>
            Address:
          </strong>{' '}
          {selectedOrder.address_line ||
            selectedOrder.address ||
            'N/A'}
        </p>

        <p>
          <strong>
            City:
          </strong>{' '}
          {selectedOrder.city ||
            'N/A'}
        </p>

        <p>
          <strong>
            State:
          </strong>{' '}
          {selectedOrder.state ||
            'N/A'}
        </p>

        <p>
          <strong>
            Pincode:
          </strong>{' '}
          {selectedOrder.pincode ||
            'N/A'}
        </p>

        {/* ================================================
            AMOUNT
        ================================================ */}

        <p>
          <strong>
            Amount:
          </strong>{' '}
          ₹
          {Number(
            selectedOrder.total_amount ||
            selectedOrder.total ||
            0
          ).toLocaleString(
            'en-IN'
          )}
        </p>

        {/* ================================================
            PAYMENT
        ================================================ */}

        <p>
          <strong>
            Payment:
          </strong>{' '}
          {selectedOrder.payment_status ||
            selectedOrder.paymentStatus ||
            'N/A'}
        </p>

        {/* ================================================
            DATE
        ================================================ */}

        <p>
          <strong>
            Date:
          </strong>{' '}
          {formatDate(
            selectedOrder.created_at ||
            selectedOrder.date
          )}
        </p>

        {/* ================================================
            RECEIVED DATE
        ================================================ */}

        {selectedOrder.received_at && (

          <p>
            <strong>
              Customer Received:
            </strong>{' '}
            {formatDate(
              selectedOrder.received_at
            )}
          </p>

        )}

        {/* ================================================
            RAZORPAY
        ================================================ */}

        {(
          selectedOrder.razorpay_order_id ||
          selectedOrder.razorpayOrderId
        ) && (

          <p>
            <strong>
              Razorpay Order:
            </strong>{' '}
            {selectedOrder.razorpay_order_id ||
              selectedOrder.razorpayOrderId}
          </p>

        )}

        {(
          selectedOrder.razorpay_payment_id ||
          selectedOrder.razorpayPaymentId
        ) && (

          <p>
            <strong>
              Razorpay Payment:
            </strong>{' '}
            {selectedOrder.razorpay_payment_id ||
              selectedOrder.razorpayPaymentId}
          </p>

        )}

        {/* ================================================
            ITEMS
        ================================================ */}

        {Array.isArray(
          selectedOrder.items
        ) &&
          selectedOrder.items.length >
            0 && (

            <div
              style={{
                marginTop: 20,
              }}
            >

              <h3
                style={{
                  marginBottom: 10,
                }}
              >
                Order Items
              </h3>

              {selectedOrder.items.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      padding:
                        '10px 0',
                      borderBottom:
                        '1px solid #eee',
                    }}
                  >

                    <div>
                      <strong>
                        {item.name ||
                          item.title ||
                          'Product'}
                      </strong>
                    </div>

                    <div>
                      Quantity:{' '}
                      {item.quantity ||
                        1}
                    </div>

                    <div>
                      Price: ₹
                      {Number(
                        item.price ||
                        0
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </div>

                  </div>

                )
              )}

            </div>
          )}

      </div>
    )
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="admin-orders-page">

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          marginBottom: 20,
          gap: 15,
          flexWrap: 'wrap',
        }}
      >

        <div>

          <h1
            className="section-title"
            style={{
              marginBottom: 5,
            }}
          >
            Orders
          </h1>

          {!loading &&
            !error && (

              <p
                style={{
                  margin: 0,
                  color: '#777',
                  fontSize: 14,
                }}
              >
                {orders.length}{' '}
                {orders.length === 1
                  ? 'order'
                  : 'orders'}
              </p>

            )}

        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            padding:
              '9px 16px',
            borderRadius: 8,
            border:
              '1px solid #ddd',
            background: '#fff',
            cursor:
              loading
                ? 'not-allowed'
                : 'pointer',
            opacity:
              loading ? 0.6 : 1,
          }}
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* SUCCESS */}

      {statusMessage && (

        <div
          style={{
            marginBottom: 18,
            padding:
              '12px 15px',
            borderRadius: 9,
            background:
              '#eaf8ef',
            border:
              '1px solid #c9ecd6',
            color:
              '#18794e',
            fontWeight: 600,
          }}
        >
          ✓ {statusMessage}
        </div>

      )}

      {/* LOADING */}

      {loading && (

        <div
          style={{
            padding:
              '50px 20px',
            textAlign:
              'center',
            color: '#777',
          }}
        >
          Loading orders...
        </div>

      )}

      {/* ERROR */}

      {!loading &&
        error && (

          <div
            style={{
              padding: 20,
              borderRadius: 10,
              background:
                '#fff1f1',
              border:
                '1px solid #ffd1d1',
              color:
                '#c62828',
              marginBottom: 20,
            }}
          >

            <strong>
              Unable to load orders
            </strong>

            <p
              style={{
                margin:
                  '8px 0 15px',
              }}
            >
              {error}
            </p>

            <button
              onClick={fetchOrders}
              style={{
                padding:
                  '8px 14px',
                borderRadius:
                  7,
                border: 'none',
                background:
                  '#8e1748',
                color: '#fff',
                cursor:
                  'pointer',
              }}
            >
              Try Again
            </button>

          </div>

        )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        orders.length === 0 && (

          <div
            style={{
              padding:
                '70px 20px',
              textAlign:
                'center',
              borderRadius:
                12,
              background:
                '#fff',
              border:
                '1px solid #eee',
            }}
          >

            <div
              style={{
                fontSize: 45,
                marginBottom: 12,
              }}
            >
              📦
            </div>

            <h2
              style={{
                margin:
                  '0 0 8px',
                color:
                  '#333',
              }}
            >
              No orders yet
            </h2>

            <p
              style={{
                margin: 0,
                color:
                  '#777',
              }}
            >
              Orders placed by customers
              will appear here.
            </p>

          </div>

        )}

      {/* ORDER TABLE */}

      {!loading &&
        !error &&
        orders.length > 0 && (

          <OrderTable
            orders={orders}
            onView={
              setSelectedOrder
            }
          />

        )}

      {/* MODAL */}

      <Modal
        open={
          !!selectedOrder
        }
        onClose={() =>
          setSelectedOrder(null)
        }
        title={
          selectedOrder?.order_number ||
          selectedOrder?.id ||
          'Order Details'
        }
      >

        {renderOrderDetails()}

      </Modal>

    </div>
  )
}