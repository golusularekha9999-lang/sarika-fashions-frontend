import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  Star,
  Send,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronDown,
  MapPin,
  Tag,
} from 'lucide-react'

import ProductGallery from '../components/ProductGallery.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

import './ProductDetails.css'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://sarika-fashions-backend-rfwh.onrender.com/api'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [showReviewForm, setShowReviewForm] = useState(false)

  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')

  const [openInfo, setOpenInfo] = useState('details')

  // =====================================================
  // DELIVERY / PINCODE
  // =====================================================

  const [pincode, setPincode] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('')
  const [deliveryError, setDeliveryError] = useState('')
  const [checkingDelivery, setCheckingDelivery] = useState(false)

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE}/products`)

        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        const data = await response.json()

        if (!data.products) {
          throw new Error('Invalid product data')
        }

        const foundProduct = data.products.find(
          (item) => String(item.id) === String(id)
        )

        if (!foundProduct) {
          setError('Product not found')
          setLoading(false)
          return
        }

        const price = Number(foundProduct.price) || 0

        const originalPrice =
          foundProduct.old_price !== null &&
          foundProduct.old_price !== undefined
            ? Number(foundProduct.old_price)
            : price

        const discount =
          originalPrice > price
            ? Math.round(
                ((originalPrice - price) / originalPrice) * 100
              )
            : 0

        const formattedProduct = {
          ...foundProduct,

          id: foundProduct.id,

          price,

          originalPrice,

          rating:
            foundProduct.rating !== null &&
            foundProduct.rating !== undefined
              ? Number(foundProduct.rating)
              : 0,

          reviews:
            foundProduct.reviews !== null &&
            foundProduct.reviews !== undefined
              ? Number(foundProduct.reviews)
              : 0,

          stock:
            foundProduct.stock === null ||
            foundProduct.stock === undefined
              ? null
              : Number(foundProduct.stock),

          discount,

          fabric: foundProduct.category,

          images: [
            foundProduct.image,
            foundProduct.image2,
            foundProduct.image3,
            foundProduct.image4,
          ].filter(Boolean),

          variant: 0,

          colors: [],
        }

        setProduct(formattedProduct)

        // =================================================
        // RELATED PRODUCTS
        // =================================================

        const related = data.products
          .filter(
            (item) =>
              item.category === foundProduct.category &&
              String(item.id) !== String(foundProduct.id)
          )
          .slice(0, 4)
          .map((item) => {
            const itemPrice = Number(item.price) || 0

            const itemOriginalPrice =
              item.old_price !== null &&
              item.old_price !== undefined
                ? Number(item.old_price)
                : itemPrice

            const itemDiscount =
              itemOriginalPrice > itemPrice
                ? Math.round(
                    ((itemOriginalPrice - itemPrice) /
                      itemOriginalPrice) *
                      100
                  )
                : 0

            return {
              ...item,

              id: item.id,

              price: itemPrice,

              originalPrice: itemOriginalPrice,

              rating:
                item.rating !== null &&
                item.rating !== undefined
                  ? Number(item.rating)
                  : 0,

              reviews:
                item.reviews !== null &&
                item.reviews !== undefined
                  ? Number(item.reviews)
                  : 0,

              stock:
                item.stock === null ||
                item.stock === undefined
                  ? null
                  : Number(item.stock),

              discount: itemDiscount,

              fabric: item.category,

              images: [
                item.image,
                item.image2,
                item.image3,
                item.image4,
              ].filter(Boolean),

              variant: 0,

              colors: [],
            }
          })

        setRelatedProducts(related)
        setLoading(false)
      } catch (err) {
        console.error('Product loading error:', err)

        setError(
          'Unable to load product. Make sure the Flask backend is running.'
        )

        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async () => {
    if (!id) return

    try {
      setReviewsLoading(true)

      const response = await fetch(`${API_BASE}/reviews/${id}`)

      if (!response.ok) {
        throw new Error('Failed to load reviews')
      }

      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews || [])

        if (data.summary) {
          setProduct((currentProduct) => {
            if (!currentProduct) return currentProduct

            return {
              ...currentProduct,
              rating: Number(data.summary.rating || 0),
              reviews: Number(data.summary.reviews || 0),
            }
          })
        }
      }
    } catch (err) {
      console.error('Reviews loading error:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    if (product) {
      loadReviews()
    }
  }, [product?.id])

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    setReviewError('')
    setReviewMessage('')

    if (!reviewName.trim()) {
      setReviewError('Please enter your name.')
      return
    }

    if (reviewRating < 1) {
      setReviewError('Please select a rating.')
      return
    }

    if (!reviewText.trim()) {
      setReviewError('Please write your review.')
      return
    }

    try {
      setReviewSubmitting(true)

      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          product_id: Number(id),
          customer_name: reviewName.trim(),
          rating: reviewRating,
          review_text: reviewText.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to submit review'
        )
      }

      setReviewMessage(
        'Thank you! Your review has been added.'
      )

      setReviewName('')
      setReviewRating(0)
      setReviewText('')

      if (data.summary) {
        setProduct((currentProduct) => {
          if (!currentProduct) return currentProduct

          return {
            ...currentProduct,
            rating: Number(data.summary.rating || 0),
            reviews: Number(data.summary.reviews || 0),
          }
        })
      }

      await loadReviews()

      setTimeout(() => {
        setShowReviewForm(false)
        setReviewMessage('')
      }, 1500)
    } catch (err) {
      console.error('Review submission error:', err)

      setReviewError(
        err.message ||
          'Unable to submit review. Please try again.'
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  // =====================================================
  // CHECK DELIVERY / PINCODE
  // =====================================================

  const handleCheckDelivery = async () => {
    const cleanedPincode = pincode.replace(/\D/g, '')

    setDeliveryError('')
    setDeliveryStatus('')

    if (cleanedPincode.length !== 6) {
      setDeliveryError(
        'Please enter a valid 6-digit pincode.'
      )
      return
    }

    try {
      setCheckingDelivery(true)

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${cleanedPincode}`
      )

      if (!response.ok) {
        throw new Error('Unable to check pincode')
      }

      const data = await response.json()

      if (
        !data ||
        !data[0] ||
        data[0].Status !== 'Success' ||
        !data[0].PostOffice ||
        data[0].PostOffice.length === 0
      ) {
        setDeliveryError(
          'Sorry, delivery is not available for this pincode.'
        )
        return
      }

      const location = data[0].PostOffice[0]

      setDeliveryStatus(
        `Delivery available to ${location.District}, ${location.State}. Estimated delivery: 3–7 business days.`
      )
    } catch (error) {
      console.error('Pincode check error:', error)

      setDeliveryError(
        'Unable to check delivery right now. Please try again.'
      )
    } finally {
      setCheckingDelivery(false)
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="product-page-loading">
        <div className="product-loading-spinner" />
        <p>Loading product...</p>
      </div>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !product) {
    return (
      <div className="product-page-error">
        <h2>{error || 'Product not found'}</h2>

        <button
          className="product-error-button"
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </button>
      </div>
    )
  }

  // =====================================================
  // HELPERS
  // =====================================================

  const wishlisted = isWishlisted(product.id)

  const rating = Number(product.rating || 0)
  const reviewCount = Number(product.reviews || 0)

  const increaseQuantity = () => {
    if (
      product.stock !== null &&
      quantity >= product.stock
    ) {
      return
    }

    setQuantity((q) => q + 1)
  }

  const decreaseQuantity = () => {
    if (quantity <= 1) return

    setQuantity((q) => q - 1)
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleBuyNow = () => {
    addToCart(product, quantity)
    navigate('/cart')
  }

  const handleWishlist = () => {
    toggleWishlist(product)
  }

  const openReviewForm = () => {
    setReviewError('')
    setReviewMessage('')
    setShowReviewForm(true)
  }

  const closeReviewForm = () => {
    if (reviewSubmitting) return

    setShowReviewForm(false)
    setReviewError('')
    setReviewMessage('')
  }

  const toggleInfo = (section) => {
    setOpenInfo(
      openInfo === section ? '' : section
    )
  }

  const formattedCategory = product.category
    ? product.category.replace(/-/g, ' ')
    : 'Saree'

  // =====================================================
  // PRODUCT PAGE
  // =====================================================

  return (
    <div className="product-details-page">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="product-breadcrumb container">

        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          Back
        </button>

        <span>/</span>

        <button onClick={() => navigate('/shop')}>
          Shop
        </button>

        <span>/</span>

        <span>{formattedCategory}</span>

      </div>

      {/* =================================================
          MAIN PRODUCT AREA
      ================================================= */}

      <main className="product-main container">

        {/* =================================================
            LEFT - PRODUCT GALLERY
        ================================================= */}

        <div className="product-gallery-column">

          <div className="product-image-badge">
            {product.discount > 0
              ? `${product.discount}% OFF`
              : 'NEW'}
          </div>

          <ProductGallery
            images={product.images}
          />

        </div>

        {/* =================================================
            RIGHT - PRODUCT INFORMATION
        ================================================= */}

        <div className="product-info-column">

          {/* BRAND / CATEGORY */}

          <div className="product-brand-row">

            <span className="product-brand">
              SARIKA FASHIONS
            </span>

            <span className="product-category-tag">
              {formattedCategory}
            </span>

          </div>

          {/* PRODUCT NAME */}

          <h1 className="product-details-name">
            {product.name}
          </h1>

          {/* RATING */}

          <div className="product-rating-row">

            <div className="rating-box">

              <span>
                {rating.toFixed(1)}
              </span>

              <Star
                size={14}
                fill="currentColor"
              />

            </div>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('reviews')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
              className="rating-review-link"
            >
              {reviewCount} Reviews
            </button>

          </div>

          {/* PRICE */}

          <div className="product-price-block">

            <span className="product-details-price">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

            {product.originalPrice > product.price && (
              <>
                <span className="product-details-original">
                  ₹
                  {product.originalPrice.toLocaleString(
                    'en-IN'
                  )}
                </span>

                <span className="product-details-discount">
                  {product.discount}% OFF
                </span>
              </>
            )}

          </div>

          <p className="tax-note">
            Inclusive of all taxes
          </p>

          {/* OFFER */}

          {product.discount > 0 && (
            <div className="product-offer-box">

              <div className="offer-icon">
                <Tag size={18} />
              </div>

              <div>
                <strong>
                  Special Price
                </strong>

                <p>
                  Save ₹
                  {(
                    product.originalPrice -
                    product.price
                  ).toLocaleString('en-IN')}{' '}
                  on this saree
                </p>
              </div>

            </div>
          )}

          {/* STOCK */}

          <div className="product-stock-row">

            {product.stock === null ? (
              <span className="in-stock">
                <Check size={15} />
                Available
              </span>
            ) : product.stock > 0 ? (
              <>
                <span className="in-stock">
                  <Check size={15} />
                  In Stock
                </span>

                <span className="stock-text">
                  {product.stock} pieces available
                </span>
              </>
            ) : (
              <span className="out-stock">
                Out of stock
              </span>
            )}

          </div>

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <div className="product-information">

            <button
              type="button"
              className="product-info-heading"
              onClick={() =>
                toggleInfo('details')
              }
            >
              <span>Product Details</span>

              <ChevronDown
                size={19}
                className={
                  openInfo === 'details'
                    ? 'rotate'
                    : ''
                }
              />
            </button>

            {openInfo === 'details' && (
              <div className="product-specifications">

                <div className="spec-row">
                  <span>Fabric</span>
                  <strong>
                    {product.fabric ||
                      product.category ||
                      'Premium Fabric'}
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Category</span>
                  <strong>
                    {formattedCategory}
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Occasion</span>
                  <strong>
                    Festive & Traditional Wear
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Saree Length</span>
                  <strong>
                    Approx. 5.5 Metres
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Blouse</span>
                  <strong>
                    Included
                  </strong>
                </div>

              </div>
            )}

          </div>

          {/* DESCRIPTION */}

          {product.description && (
            <div className="product-information">

              <button
                type="button"
                className="product-info-heading"
                onClick={() =>
                  toggleInfo('description')
                }
              >
                <span>Description</span>

                <ChevronDown
                  size={19}
                  className={
                    openInfo === 'description'
                      ? 'rotate'
                      : ''
                  }
                />
              </button>

              {openInfo === 'description' && (
                <div className="product-description-content">
                  <p>
                    {product.description}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="product-buy-row">

            <div className="product-quantity">

              <span>Quantity</span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    product.stock !== null &&
                    quantity >= product.stock
                  }
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="product-action-row">

            <button
              className="product-add-cart"
              onClick={handleAddToCart}
              disabled={
                product.stock !== null &&
                product.stock <= 0
              }
            >
              <ShoppingBag size={19} />
              Add to Cart
            </button>

            <button
              className={`product-wishlist ${
                wishlisted ? 'is-active' : ''
              }`}
              onClick={handleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart
                size={21}
                fill={
                  wishlisted
                    ? 'currentColor'
                    : 'none'
                }
              />
            </button>

          </div>

          {/* BUY NOW */}

          <button
            className="product-buy-now"
            onClick={handleBuyNow}
            disabled={
              product.stock !== null &&
              product.stock <= 0
            }
          >
            Buy Now
          </button>

          {/* =================================================
              DELIVERY
          ================================================= */}

          <div className="delivery-card">

            <div className="delivery-card-title">
              <Truck size={19} />
              <strong>Delivery & Services</strong>
            </div>

            <div className="delivery-input">

              <MapPin size={17} />

              <input
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)

                  setPincode(value)
                  setDeliveryError('')
                  setDeliveryStatus('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCheckDelivery()
                  }
                }}
                placeholder="Enter your pincode"
                maxLength={6}
                aria-label="Enter pincode"
              />

              <button
                type="button"
                onClick={handleCheckDelivery}
                disabled={checkingDelivery}
              >
                {checkingDelivery
                  ? 'Checking...'
                  : 'Check'}
              </button>

            </div>

            {!deliveryStatus && !deliveryError && (
              <p className="delivery-note">
                Enter your pincode to check estimated
                delivery availability.
              </p>
            )}

            {deliveryStatus && (
              <div className="delivery-success">
                <Check size={16} />
                <span>{deliveryStatus}</span>
              </div>
            )}

            {deliveryError && (
              <div className="delivery-error">
                <X size={16} />
                <span>{deliveryError}</span>
              </div>
            )}

          </div>

          {/* =================================================
              TRUST FEATURES
          ================================================= */}

          <div className="product-trust-grid">

            <div className="trust-item">

              <Truck size={20} />

              <div>
                <strong>
                  Free Shipping
                </strong>

                <span>
                  On orders above ₹999
                </span>
              </div>

            </div>

            <div className="trust-item">

              <RotateCcw size={20} />

              <div>
                <strong>
                  Easy Returns
                </strong>

                <span>
                  7 day return policy
                </span>
              </div>

            </div>

            <div className="trust-item">

              <ShieldCheck size={20} />

              <div>
                <strong>
                  Secure Payment
                </strong>

                <span>
                  100% secure checkout
                </span>
              </div>

            </div>

            <div className="trust-item">

              <Check size={20} />

              <div>
                <strong>
                  Quality Assured
                </strong>

                <span>
                  Premium selected sarees
                </span>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* =================================================
          DESCRIPTION / SERVICE SECTION
      ================================================= */}

      <section className="product-service-section">

        <div className="container">

          <div className="service-grid">

            <div className="service-content">

              <p className="section-eyebrow">
                SARIKA FASHIONS
              </p>

              <h2>
                Every Saree Has a Story.
              </h2>

              <p>
                Discover thoughtfully selected sarees
                designed to bring traditional elegance
                into every special occasion.
              </p>

            </div>

            <div className="service-features">

              <div>
                <Truck size={23} />
                <strong>Fast Delivery</strong>
                <span>
                  Reliable delivery across India
                </span>
              </div>

              <div>
                <RotateCcw size={23} />
                <strong>7 Day Returns</strong>
                <span>
                  Simple and convenient returns
                </span>
              </div>

              <div>
                <ShieldCheck size={23} />
                <strong>Secure Checkout</strong>
                <span>
                  Safe and secure payments
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          REVIEWS
      ================================================= */}

      <section
        className="product-reviews-section container"
        id="reviews"
      >

        <div className="reviews-section-heading">

          <div>

            <p className="section-eyebrow">
              CUSTOMER LOVE
            </p>

            <h2 className="section-title">
              Reviews & Ratings
            </h2>

          </div>

          <button
            type="button"
            className="review-write-button"
            onClick={openReviewForm}
          >
            <Star size={17} />
            Write a Review
          </button>

        </div>

        {/* REVIEW SUMMARY */}

        <div className="reviews-summary-card">

          <div className="reviews-average">

            <span className="reviews-big-rating">
              {rating.toFixed(1)}
            </span>

            <div className="reviews-stars">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={
                      star <= Math.round(rating)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                )
              )}

            </div>

            <span className="reviews-total">
              Based on {reviewCount}{' '}
              review
              {reviewCount === 1 ? '' : 's'}
            </span>

          </div>

          <div className="reviews-summary-text">

            <strong>
              What our customers think
            </strong>

            <p>
              Your experience helps other
              customers discover their next
              favourite saree.
            </p>

          </div>

        </div>

        {/* =================================================
            REVIEW FORM
        ================================================= */}

        {showReviewForm && (
          <div className="review-form-card">

            <div className="review-form-header">

              <div>

                <p className="review-form-eyebrow">
                  SHARE YOUR EXPERIENCE
                </p>

                <h3>
                  How did you like this saree?
                </h3>

              </div>

              <button
                type="button"
                className="review-form-close"
                onClick={closeReviewForm}
                disabled={reviewSubmitting}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmitReview}>

              <div className="review-form-field">

                <label>
                  Your Name
                </label>

                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) =>
                    setReviewName(e.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={100}
                  disabled={reviewSubmitting}
                />

              </div>

              <div className="review-form-field">

                <label>
                  Your Rating
                </label>

                <div className="review-star-selector">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          star <= reviewRating
                            ? 'selected'
                            : ''
                        }
                        onClick={() =>
                          setReviewRating(star)
                        }
                        disabled={reviewSubmitting}
                      >
                        <Star
                          size={28}
                          fill={
                            star <= reviewRating
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    )
                  )}

                </div>

                {reviewRating > 0 && (
                  <span className="selected-rating-text">
                    {reviewRating === 1 &&
                      'Not great'}
                    {reviewRating === 2 &&
                      'Could be better'}
                    {reviewRating === 3 &&
                      'It was good'}
                    {reviewRating === 4 &&
                      'Loved it'}
                    {reviewRating === 5 &&
                      'Absolutely loved it!'}
                  </span>
                )}

              </div>

              <div className="review-form-field">

                <label>
                  Your Review
                </label>

                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  placeholder="Tell us what you loved about this saree..."
                  rows={5}
                  maxLength={2000}
                  disabled={reviewSubmitting}
                />

                <span className="review-character-count">
                  {reviewText.length}/2000
                </span>

              </div>

              {reviewError && (
                <div className="review-form-error">
                  {reviewError}
                </div>
              )}

              {reviewMessage && (
                <div className="review-form-success">
                  {reviewMessage}
                </div>
              )}

              <button
                type="submit"
                className="review-submit-button"
                disabled={reviewSubmitting}
              >
                <Send size={17} />

                {reviewSubmitting
                  ? 'Submitting...'
                  : 'Submit Review'}
              </button>

            </form>

          </div>
        )}

        {/* =================================================
            REVIEWS LIST
        ================================================= */}

        <div className="reviews-list">

          {reviewsLoading ? (
            <div className="reviews-loading">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews-card">

              <div className="no-reviews-icon">
                <Star size={24} />
              </div>

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first to share your
                experience with this saree.
              </p>

              <button
                type="button"
                className="review-write-button"
                onClick={openReviewForm}
              >
                <Star size={16} />
                Write the First Review
              </button>

            </div>
          ) : (
            reviews.map((review) => (
              <article
                className="review-card"
                key={review.id}
              >

                <div className="review-card-top">

                  <div className="reviewer-info">

                    <div className="reviewer-avatar">
                      {review.customer_name
                        ?.charAt(0)
                        ?.toUpperCase() || 'C'}
                    </div>

                    <div>

                      <h4>
                        {review.customer_name}
                      </h4>

                      <span>
                        {review.created_at
                          ? new Date(
                              review.created_at
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : ''}
                      </span>

                    </div>

                  </div>

                  <div className="review-card-stars">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          size={15}
                          fill={
                            star <=
                            Number(review.rating)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      )
                    )}

                  </div>

                </div>

                <p className="review-card-text">
                  {review.review_text}
                </p>

              </article>
            ))
          )}

        </div>

      </section>

      {/* =================================================
          RELATED PRODUCTS
      ================================================= */}

      {relatedProducts.length > 0 && (
        <section className="product-related-section">

          <div className="container">

            <div className="section-heading">

              <div>

                <p className="section-eyebrow">
                  YOU MAY ALSO LIKE
                </p>

                <h2 className="section-title">
                  More from {formattedCategory}
                </h2>

              </div>

              <button
                type="button"
                className="view-all-products"
                onClick={() =>
                  navigate('/shop')
                }
              >
                View All
              </button>

            </div>

            <div className="product-related-grid">

              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                )
              )}

            </div>

          </div>

        </section>
      )}

    </div>
  )
}


