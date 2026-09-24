import React from 'react'

export default function OrderTable({ orders = [], onView }) {
  const safeOrders = Array.isArray(orders) ? orders : []

  const formatAmount = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) {
      return '₹0'
    }

    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'

    try {
      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return String(value)
      }

      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return String(value)
    }
  }

  const getOrderId = (order) => {
    return (
      order?.id ||
      order?.order_number ||
      order?.orderId ||
      'N/A'
    )
  }

  const getCustomerName = (order) => {
    return (
      order?.customer ||
      order?.customer_name ||
      order?.name ||
      order?.customerName ||
      'Guest Customer'
    )
  }

  const getAmount = (order) => {
    return (
      order?.amount ??
      order?.total_amount ??
      order?.total ??
      order?.totalAmount ??
      0
    )
  }

  const getStatus = (order) => {
    return (
      order?.status ||
      order?.order_status ||
      'Pending'
    )
  }

  const getPaymentStatus = (order) => {
    return (
      order?.paymentStatus ||
      order?.payment_status ||
      order?.payment_status_text ||
      'N/A'
    )
  }

  const getDate = (order) => {
    return (
      order?.date ||
      order?.created_at ||
      order?.createdAt
    )
  }

  if (safeOrders.length === 0) {
    return (
      <div
        style={{
          padding: '50px 20px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #eee',
          color: '#777',
        }}
      >
        <div
          style={{
            fontSize: '42px',
            marginBottom: '12px',
          }}
        >
          📦
        </div>

        <h3
          style={{
            margin: '0 0 8px',
            color: '#333',
          }}
        >
          No orders yet
        </h3>

        <p style={{ margin: 0 }}>
          Customer orders will appear here once they are placed.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        background: '#fff',
        borderRadius: '14px',
        border: '1px solid #eee',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '850px',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid #eee',
              background: '#fafafa',
            }}
          >
            <th style={thStyle}>Order ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Payment</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {safeOrders.map((order, index) => {
            const amount = getAmount(order)
            const status = getStatus(order)
            const paymentStatus = getPaymentStatus(order)

            return (
              <tr
                key={
                  order?.id ||
                  order?.order_number ||
                  order?.orderId ||
                  index
                }
                style={{
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <td style={tdStyle}>
                  <strong>
                    {getOrderId(order)}
                  </strong>
                </td>

                <td style={tdStyle}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    {getCustomerName(order)}
                  </div>

                  {order?.email && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '3px',
                      }}
                    >
                      {order.email}
                    </div>
                  )}
                </td>

                <td style={tdStyle}>
                  <strong>
                    {formatAmount(amount)}
                  </strong>
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      background:
                        String(paymentStatus).toLowerCase() ===
                        'paid'
                          ? '#e8f7ee'
                          : '#fff5df',
                      color:
                        String(paymentStatus).toLowerCase() ===
                        'paid'
                          ? '#238b45'
                          : '#9a6b00',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {paymentStatus}
                  </span>
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      background: '#f5f1f5',
                      color: '#8e1748',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {status}
                  </span>
                </td>

                <td style={tdStyle}>
                  {formatDate(getDate(order))}
                </td>

                <td style={tdStyle}>
                  <button
                    type="button"
                    onClick={() => onView?.(order)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #8e1748',
                      background: '#fff',
                      color: '#8e1748',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: '#555',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '15px 16px',
  fontSize: '14px',
  color: '#444',
  verticalAlign: 'middle',
}