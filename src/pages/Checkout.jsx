import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package } from 'lucide-react'

import CheckoutSteps from '../components/CheckoutSteps.jsx'
import OrderSummary from '../components/OrderSummary.jsx'
import { useCart } from '../context/CartContext.jsx'

import './Checkout.css'

// ============================================================
// API BASE
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
// STORAGE KEYS
// ============================================================

const CUSTOMER_TOKEN_KEY = 'sarika_customer_order_token'
const CUSTOMER_PHONE_KEY = 'sarika_customer_phone'
const PENDING_ORDER_KEY = 'sarika_pending_order'
const SAVED_ADDRESS_KEY = 'sarika_saved_address'

// ============================================================
// EMPTY ADDRESS
// ============================================================

const getInitialAddress = () => {
  try {
    const saved = localStorage.getItem(SAVED_ADDRESS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    // ignore
  }
  return {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  }
}

// ============================================================
// CHECKOUT
// ============================================================

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, shipping, total, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState(getInitialAddress)
  const [errors, setErrors] = useState({})
  const [placed, setPlaced] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // ==========================================================
  // MOBILE REDIRECT RECOVERY (IF PAGE RELOADED DURING UPI)
  // ==========================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const razorpay_payment_id = params.get('razorpay_payment_id')
    const razorpay_order_id = params.get('razorpay_order_id')
    const razorpay_signature = params.get('razorpay_signature')

    if (razorpay_payment_id && razorpay_order_id) {
      const pendingRaw = localStorage.getItem(PENDING_ORDER_KEY)
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw)
          setPaymentLoading(true)

          axios
            .post(
              `${API_BASE}/payment/complete`,
              {
                ...pending,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              { withCredentials: true, timeout: 30000 }
            )
            .then(res => {
              if (res.data?.customer_order_token) {
                localStorage.setItem(CUSTOMER_TOKEN_KEY, res.data.customer_order_token)
              }
              if (pending.customer_phone) {
                localStorage.setItem(CUSTOMER_PHONE_KEY, pending.customer_phone)
              }
              localStorage.removeItem(PENDING_ORDER_KEY)
              clearCart()
              navigate('/my-orders')
            })
            .catch(err => {
              console.error('Pending recovery error:', err)
              setPaymentLoading(false)
            })
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [navigate, clearCart])

  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (items.length === 0 && !placed) {
    return (
      <div className="container empty-state">
        <h2>Your cart is empty.</h2>
        <p>Add some sarees before checking out.</p>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  // ==========================================================
  // VALIDATE ADDRESS
  // ==========================================================

  const validateAddress = () => {
    const next = {}

    if (!address.fullName.trim()) {
      next.fullName = 'Full name is required'
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      next.phone = 'Enter a valid 10-digit phone number'
    }

    if (!address.address.trim()) {
      next.address = 'Address is required'
    }

    if (!address.city.trim()) {
      next.city = 'City is required'
    }

    if (!address.state.trim()) {
      next.state = 'State is required'
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      next.pincode = 'Enter a valid 6-digit pincode'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ==========================================================
  // SHIPPING SUBMIT
  // ==========================================================

  const handleShippingSubmit = event => {
    event.preventDefault()

    if (validateAddress()) {
      try {
        localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(address))
        localStorage.setItem(CUSTOMER_PHONE_KEY, address.phone.trim())
      } catch (e) {}
      setStep(2)
    }
  }

  const update = field => event => {
    setAddress(current => ({
      ...current,
      [field]: event.target.value,
    }))

    setErrors(current => ({
      ...current,
      [field]: '',
    }))
  }

  // ==========================================================
  // SAVE ORDER AFTER PAYMENT
  // ==========================================================

  const saveOrder = async (paymentResponse, razorpayOrderId) => {
    const orderItems = items.map(item => ({
      id: item.id,
      product_id: item.product_id || item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image || item.imageUrl || item.image2 || '',
    }))

    const existingToken = localStorage.getItem(CUSTOMER_TOKEN_KEY)

    const orderData = {
      customer_name: address.fullName.trim(),
      customer_phone: address.phone.trim(),
      address: address.address.trim(),
      address_line: address.address.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),

      items: orderItems,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total_amount: Number(total),

      customer_order_token: existingToken || undefined,

      razorpay_order_id:
        paymentResponse?.razorpay_order_id || razorpayOrderId || null,
      razorpay_payment_id:
        paymentResponse?.razorpay_payment_id || null,
      razorpay_signature:
        paymentResponse?.razorpay_signature || null,
    }

    console.log('🛒 COMPLETING PAYMENT:', orderData)

    const response = await axios.post(`${API_BASE}/payment/complete`, orderData, {
      headers: existingToken ? { 'X-Customer-Order-Token': existingToken } : {},
      withCredentials: true,
      timeout: 30000,
    })

    console.log('✅ ORDER SAVED RESPONSE:', response.data)

    // Save token & phone number
    const customerToken =
      response.data?.customer_order_token || response.data?.token
    if (customerToken) {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, customerToken)
    }
    if (address.phone) {
      localStorage.setItem(CUSTOMER_PHONE_KEY, address.phone.trim())
    }

    localStorage.removeItem(PENDING_ORDER_KEY)

    if (response.data?.order_number) {
      setOrderNumber(response.data.order_number)
    }

    return response.data
  }

  // ==========================================================
  // RAZORPAY PAYMENT
  // ==========================================================

  const handlePlaceOrder = async () => {
    if (paymentLoading) return

    try {
      setPaymentLoading(true)

      const response = await axios.post(
        `${API_BASE}/payment/create-order`,
        { amount: Number(total) },
        { withCredentials: true, timeout: 30000 }
      )

      const { order_id, amount, currency, key_id } = response.data || {}

      if (!order_id || !amount || !currency || !key_id) {
        throw new Error('Could not create Razorpay payment order.')
      }

      if (!window.Razorpay) {
        alert('Razorpay failed to load. Please refresh and try again.')
        setPaymentLoading(false)
        return
      }

      // Save pending order in localStorage for mobile UPI recovery
      const orderItems = items.map(item => ({
        id: item.id,
        product_id: item.product_id || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || item.imageUrl || '',
      }))

      try {
        localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            customer_name: address.fullName,
            customer_phone: address.phone,
            address: address.address,
            address_line: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            items: orderItems,
            subtotal: Number(subtotal),
            shipping: Number(shipping),
            total_amount: Number(total),
            razorpay_order_id: order_id,
          })
        )
      } catch (e) {}

      const options = {
        key: key_id,
        amount,
        currency,
        name: 'Sarika Fashions',
        description: 'Saree Purchase',
        order_id,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: '#8E1748',
        },
        handler: async paymentResponse => {
          console.log('💳 Razorpay Success:', paymentResponse)
          try {
            await saveOrder(paymentResponse, order_id)
            clearCart()
            setPaymentLoading(false)
            setPlaced(true)

            // Direct redirect to My Orders after 1.5 seconds or let them view page
            setTimeout(() => {
              navigate('/my-orders')
            }, 1500)
          } catch (error) {
            console.error('❌ ORDER SAVE FAILED:', error)
            setPaymentLoading(false)
            const errorMsg =
              error.response?.data?.message ||
              error.response?.data?.error ||
              'Payment succeeded, but saving the order had an issue.'
            alert(
              `${errorMsg}\nPayment ID: ${paymentResponse?.razorpay_payment_id}`
            )
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', resp => {
        alert(resp?.error?.description || 'Payment failed. Please try again.')
        setPaymentLoading(false)
      })

      razorpay.open()
    } catch (error) {
      console.error('❌ Payment start error:', error)
      alert(error.response?.data?.message || error.message || 'Unable to start payment.')
      setPaymentLoading(false)
    }
  }

  // ==========================================================
  // PAYMENT SUCCESS PAGE
  // ==========================================================

  if (placed) {
    return (
      <div className="container empty-state">
        <CheckCircle2 size={64} color="var(--color-success)" strokeWidth={1.4} />
        <h2>Order Placed Successfully!</h2>
        <p>Your payment was successful. Redirecting to your orders...</p>

        {orderNumber && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 20px',
              borderRadius: '12px',
              background: '#fff9f0',
              border: '1px solid #ead7c0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
            }}
          >
            <Package size={20} />
            <span>
              Order ID: <strong>{orderNumber}</strong>
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
          <Link to="/my-orders" className="btn btn-primary">
            Go to My Orders
          </Link>
        </div>
      </div>
    )
  }

  // ==========================================================
  // CHECKOUT PAGE
  // ==========================================================

  return (
    <div className="container checkout-page">
      <h1 className="section-title">Checkout</h1>
      <CheckoutSteps current={step} />

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <form className="checkout-card" onSubmit={handleShippingSubmit}>
              <h3>Shipping Address</h3>

              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={address.fullName}
                  onChange={update('fullName')}
                  className={errors.fullName ? 'has-error' : ''}
                  autoComplete="name"
                />
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>

              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={address.phone}
                  onChange={update('phone')}
                  className={errors.phone ? 'has-error' : ''}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>

              <div className="field">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={address.address}
                  onChange={update('address')}
                  className={errors.address ? 'has-error' : ''}
                  autoComplete="street-address"
                />
                {errors.address && <div className="field-error">{errors.address}</div>}
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={address.city}
                    onChange={update('city')}
                    className={errors.city ? 'has-error' : ''}
                    autoComplete="address-level2"
                  />
                  {errors.city && <div className="field-error">{errors.city}</div>}
                </div>

                <div className="field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    value={address.state}
                    onChange={update('state')}
                    className={errors.state ? 'has-error' : ''}
                    autoComplete="address-level1"
                  />
                  {errors.state && <div className="field-error">{errors.state}</div>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  type="text"
                  value={address.pincode}
                  onChange={update('pincode')}
                  className={errors.pincode ? 'has-error' : ''}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
                {errors.pincode && <div className="field-error">{errors.pincode}</div>}
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="checkout-card">
              <h3>Payment</h3>
              <div className="razorpay-info">
                <h4>Secure Payment</h4>
                <p>Click the button below to continue to Razorpay secure checkout.</p>
                <p>UPI supported (PhonePe, Google Pay, Paytm) & Cards.</p>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  disabled={paymentLoading}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  disabled={paymentLoading}
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-card">
              <h3>Review Your Order</h3>

              <div className="review-block">
                <h4>Shipping To</h4>
                <p>{address.fullName}, {address.phone}</p>
                <p>{address.address}, {address.city}, {address.state} - {address.pincode}</p>
              </div>

              <div className="review-block">
                <h4>Items ({items.length})</h4>
                {items.map(item => (
                  <div className="review-item" key={item.key || item.id || item.product_id}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                  disabled={paymentLoading}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing Order...' : `Pay ₹${Number(total).toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total} />
      </div>
    </div>
  )
}