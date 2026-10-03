import React, { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  X,
} from 'lucide-react'
import './AddToCartPopup.css'

export default function AddToCartPopup({
  item,
  cartCount,
  cartSubtotal,
  onClose,
}) {
  const location = useLocation()
  const initialPath = useRef(location.pathname)

  // Close popup only when the user navigates
  // to a different page.
  useEffect(() => {
    if (location.pathname !== initialPath.current) {
      onClose()
    }
  }, [location.pathname, onClose])

  // Close popup with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Don't render if there is no item
  if (!item) {
    return null
  }

  // Get the saree image
  const imageSrc =
    item.image ||
    item.images?.[0] ||
    null

  // Get price and quantity safely
  const price = Number(item.price || 0)
  const quantity = Number(item.quantity || 1)

  return (
    <div
      className="cart-popup-overlay"
      onClick={onClose}
    >
      <div
        className="cart-popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Added to cart"
      >

        {/* HEADER */}
        <div className="cart-popup-header">

          <div className="cart-popup-badge">
            <CheckCircle2
              size={18}
              className="cart-popup-check-icon"
            />

            <span>
              Added to Cart!
            </span>
          </div>

          <button
            type="button"
            className="cart-popup-close-btn"
            onClick={onClose}
            aria-label="Close popup"
          >
            <X size={18} />
          </button>

        </div>


        {/* SAREE DETAILS */}
        <div className="cart-popup-item">

          {/* SAREE IMAGE */}
          <div className="cart-popup-thumb">

            {imageSrc ? (
              <img
                src={imageSrc}
                alt={item.name || 'Saree'}
              />
            ) : (
              <div className="cart-popup-no-img">
                <ShoppingBag size={24} />
              </div>
            )}

          </div>


          {/* SAREE INFORMATION */}
          <div className="cart-popup-details">

            <h4 className="cart-popup-title">
              {item.name || 'Saree'}
            </h4>

            <div className="cart-popup-meta">

              <span className="cart-popup-price">
                ₹{price.toLocaleString('en-IN')}
              </span>

              <span className="cart-popup-qty">
                Qty: {quantity}
              </span>

              {item.color && (
                <span className="cart-popup-color">
                  Color: {item.color}
                </span>
              )}

            </div>

          </div>

        </div>


        {/* CART SUMMARY */}
        <div className="cart-popup-summary">

          <div className="cart-popup-summary-row">

            <span>
              Cart Subtotal (
              {cartCount}
              {' '}
              {cartCount === 1 ? 'item' : 'items'}
              ):
            </span>

            <strong>
              ₹
              {Number(cartSubtotal || 0)
                .toLocaleString('en-IN')}
            </strong>

          </div>

          <p className="cart-popup-shipping-note">
            Standard Delivery: ₹75 per order
          </p>

        </div>


        {/* BUTTONS */}
        <div className="cart-popup-actions">

          {/* VIEW CART */}
          <Link
            to="/cart"
            className="cart-popup-btn cart-popup-btn-primary"
            onClick={onClose}
          >
            <span>
              View Cart & Checkout
            </span>

            <ArrowRight size={16} />
          </Link>


          {/* CONTINUE SHOPPING */}
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