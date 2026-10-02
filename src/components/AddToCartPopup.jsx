

import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, ArrowRight, X } from 'lucide-react'
import './AddToCartPopup.css'

export default function AddToCartPopup({
  item,
  cartCount,
  cartSubtotal,
  onClose,
}) {
  const location = useLocation()

  // Auto-close if user navigates to another page
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!item) return null

  const imageSrc =
    item.image ||
    item.imageUrl ||
    item.image2 ||
    (Array.isArray(item.images) ? item.images[0] : null)

  const price = Number(item.price || 0)
  const quantity = Number(item.quantity || 1)

  return (
    <div className="cart-popup-overlay" onClick={onClose}>
      <div
        className="cart-popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="cart-popup-header">
          <div className="cart-popup-badge">
            <CheckCircle2 size={18} className="cart-popup-check-icon" />
            <span>Added to Cart!</span>
          </div>
          <button
            type="button"
            className="cart-popup-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ITEM DETAILS */}
        <div className="cart-popup-item">
          <div className="cart-popup-thumb">
            {imageSrc ? (
              <img src={imageSrc} alt={item.name || 'Saree'} />
            ) : (
              <div className="cart-popup-no-img">
                <ShoppingBag size={24} />
              </div>
            )}
          </div>

          <div className="cart-popup-details">
            <h4 className="cart-popup-title">{item.name || 'Saree'}</h4>
            <div className="cart-popup-meta">
              <span className="cart-popup-price">
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="cart-popup-qty">Qty: {quantity}</span>
              {item.color && (
                <span className="cart-popup-color">Color: {item.color}</span>
              )}
            </div>
          </div>
        </div>

        {/* CART SUMMARY STRIP */}
        <div className="cart-popup-summary">
          <div className="cart-popup-summary-row">
            <span>
              Cart Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):
            </span>
            <strong>₹{Number(cartSubtotal).toLocaleString('en-IN')}</strong>
          </div>
          <p className="cart-popup-shipping-note">
            Standard Delivery: ₹75 per order
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="cart-popup-actions">
          <Link
            to="/cart"
            className="cart-popup-btn cart-popup-btn-primary"
            onClick={onClose}
          >
            <span>View Cart & Checkout</span>
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            className="cart-popup-btn cart-popup-btn-secondary"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}