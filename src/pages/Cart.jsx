import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { getProductById } from '../data/products.js'
import OrderSummary from '../components/OrderSummary.jsx'
import SareeArt from '../components/SareeArt.jsx'
import './Cart.css'

export default function Cart() {
  const { items, subtotal, shipping, total, updateQuantity, removeFromCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <ShoppingBag size={56} strokeWidth={1} />
        <h2>Your cart is empty.</h2>
        <p>Looks like you haven't added any sarees yet.</p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <h1 className="section-title">Your Cart ({items.length} {items.length === 1? 'Item' : 'Items'})</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const product = getProductById(item.id)
            const imageSrc = item.image || product?.image || product?.images?.[0]

            return (
              <div className="cart-item" key={item.key}>
                <Link to={`/product/${item.id}`}>
                  {imageSrc? (
                    <img src={imageSrc} alt={item.name} style={{ width: '90px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <SareeArt variant={item.variant} />
                  )}
                </Link>

                <div className="cart-item-details">
                  <Link to={`/product/${item.id}`}><h4>{item.name}</h4></Link>
                  <p>₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>

                <button onClick={() => removeFromCart(item.key)}><Trash2 size={16} /></button>
              </div>
            )
          })}
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <Link to="/checkout" className="btn btn-primary btn-block">Proceed to Checkout</Link>
          <Link to="/shop" className="cart-continue-link">Continue Shopping</Link>
        </OrderSummary>
      </div>
    </div>
  )
}