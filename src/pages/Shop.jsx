import React, {
  useEffect,
  useState,
  useMemo,
} from 'react'

import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'

import FilterSidebar from '../components/FilterSidebar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { colors } from '../data/products.js'

import './Shop.css'

// ============================================================
// PRODUCTION API
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://sarika-fashions-backend-rfwh.onrender.com/api'

// ============================================================
// COLOR DETECTION
// ============================================================

const getProductColors = (product) => {
  // If backend already provides colors, use them
  if (
    Array.isArray(product.colors) &&
    product.colors.length > 0
  ) {
    return product.colors
  }

  // If backend provides a single color field
  if (product.color) {
    const backendColor = String(product.color)
      .toLowerCase()
      .trim()

    const matchedColor = colors.find(
      (c) =>
        c.id.toLowerCase() === backendColor ||
        c.name.toLowerCase() === backendColor
    )

    if (matchedColor) {
      return [matchedColor.id]
    }
  }

  // ============================================================
  // FALLBACK: Detect color from product information
  // ============================================================

  const text = [
    product.name,
    product.product_name,
    product.category,
    product.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const detectedColors = []

  colors.forEach((color) => {
    const colorName = color.name.toLowerCase()
    const colorId = color.id.toLowerCase()

    if (
      text.includes(colorName) ||
      text.includes(colorId)
    ) {
      detectedColors.push(color.id)
    }
  })

  return detectedColors
}

// ============================================================
// SHOP PAGE
// ============================================================

export default function Shop() {
  const [searchParams] = useSearchParams()

  const initialCategory =
    searchParams.get('category')

  const searchQuery =
    searchParams.get('search')?.toLowerCase() || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================================
  // FILTER STATE
  // ============================================================

  const [filters, setFilters] = useState({
    categories: initialCategory
      ? [initialCategory]
      : [],
    colors: [],
    minPrice: 1,
    maxPrice: 1000,
  })

  const [sortBy, setSortBy] = useState('newest')
  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false)

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE}/products`
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load products: ${response.status}`
          )
        }

        const data = await response.json()

        const backendProducts =
          Array.isArray(data.products)
            ? data.products
            : []

        const formattedProducts =
          backendProducts.map((product) => {
            const productId =
              product.id ??
              product.product_id

            const productName =
              product.name ??
              product.product_name ??
              'Saree'

            const productPrice =
              Number(product.price) || 0

            const oldPrice =
              Number(
                product.old_price ??
                  product.original_price ??
                  product.oldPrice
              ) || 0

            const productStock =
              product.stock ??
              product.stock_quantity

            const productCategory =
              product.category ?? ''

            const productDescription =
              product.description ?? ''

            const productColors =
              getProductColors({
                ...product,
                name: productName,
                category: productCategory,
                description: productDescription,
              })

            return {
              ...product,

              // ==================================================
              // STANDARD PRODUCT FIELDS
              // ==================================================

              id: productId,

              name: productName,

              price: productPrice,

              originalPrice: oldPrice,

              rating:
                Number(product.rating) || 0,

              reviews:
                Number(product.reviews) || 0,

              stock:
                productStock === null ||
                productStock === undefined
                  ? null
                  : Number(productStock),

              category: productCategory,

              description:
                productDescription,

              discount:
                oldPrice > productPrice
                  ? Math.round(
                      (
                        (oldPrice - productPrice) /
                        oldPrice
                      ) * 100
                    )
                  : 0,

              fabric:
                product.fabric ??
                productCategory,

              images: [
                product.image,
                product.image2,
                product.image3,
                product.image4,
                product.image_url,
              ].filter(Boolean),

              variant: 0,

              colors: productColors,
            }
          })

        setProducts(formattedProducts)
      } catch (err) {
        console.error(
          'Product loading error:',
          err
        )

        setError(
          'Unable to load products.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // ============================================================
  // CATEGORY FILTER
  // ============================================================

  const toggleCategory = (id) => {
    setFilters((f) => ({
      ...f,

      categories:
        f.categories.includes(id)
          ? f.categories.filter(
              (c) => c !== id
            )
          : [...f.categories, id],
    }))
  }

  // ============================================================
  // COLOR FILTER
  // ============================================================

  const toggleColor = (id) => {
    setFilters((f) => ({
      ...f,

      colors:
        f.colors.includes(id)
          ? f.colors.filter(
              (c) => c !== id
            )
          : [...f.colors, id],
    }))
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      minPrice: 1,
      maxPrice: 1000,
    })
  }

  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filtered = useMemo(() => {
    let result = products.filter(
      (product) => {
        // ------------------------------------------------------
        // CATEGORY
        // ------------------------------------------------------

        const matchesCategory =
          filters.categories.length === 0 ||
          filters.categories.includes(
            product.category
          )

        // ------------------------------------------------------
        // COLOR
        // ------------------------------------------------------

        const matchesColor =
          filters.colors.length === 0 ||
          filters.colors.some(
            (selectedColor) =>
              (product.colors || []).includes(
                selectedColor
              )
          )

        // ------------------------------------------------------
        // PRICE
        // ------------------------------------------------------

        const productPrice =
          Number(product.price)

        const matchesPrice =
          productPrice >=
            filters.minPrice &&
          productPrice <=
            filters.maxPrice

        // ------------------------------------------------------
        // SEARCH
        // ------------------------------------------------------

        const productName =
          String(
            product.name || ''
          ).toLowerCase()

        const productDescription =
          String(
            product.description || ''
          ).toLowerCase()

        const matchesSearch =
          !searchQuery ||
          productName.includes(
            searchQuery
          ) ||
          productDescription.includes(
            searchQuery
          )

        return (
          matchesCategory &&
          matchesColor &&
          matchesPrice &&
          matchesSearch
        )
      }
    )

    // ==========================================================
    // SORT
    // ==========================================================

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort(
          (a, b) =>
            a.price - b.price
        )
        break

      case 'price-high':
        result = [...result].sort(
          (a, b) =>
            b.price - a.price
        )
        break

      case 'rating':
        result = [...result].sort(
          (a, b) =>
            b.rating - a.rating
        )
        break

      default:
        result = [...result].sort(
          (a, b) =>
            Number(b.id) -
            Number(a.id)
        )
        break
    }

    return result
  }, [
    products,
    filters,
    sortBy,
    searchQuery,
  ])

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <h2>Loading sarees...</h2>
      </div>
    )
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div
        className="container"
        style={{
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <h2>{error}</h2>

        <p
          style={{
            marginTop: '10px',
          }}
        >
          Make sure the Flask backend is
          running.
        </p>
      </div>
    )
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="container shop-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="shop-header">

        <div>

          <h1 className="section-title">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : 'Shop All Sarees'}
          </h1>

          <p className="shop-count">
            Showing {filtered.length} of{' '}
            {products.length} results
          </p>

        </div>

        <div className="shop-header-actions">

          <button
            type="button"
            className="btn btn-outline btn-sm mobile-only"
            onClick={() =>
              setMobileFiltersOpen(true)
            }
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          <select
            className="shop-sort"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="newest">
              Sort by: Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Rating
            </option>
          </select>

        </div>

      </div>

      {/* ======================================================
          SHOP LAYOUT
      ====================================================== */}

      <div className="shop-layout">

        <FilterSidebar
          filters={filters}

          onCategoryToggle={
            toggleCategory
          }

          onColorToggle={
            toggleColor
          }

          onPriceChange={(value) =>
            setFilters((f) => ({
              ...f,
              maxPrice: Number(value),
            }))
          }

          onClear={clearFilters}

          mobileOpen={
            mobileFiltersOpen
          }

          onCloseMobile={() =>
            setMobileFiltersOpen(false)
          }
        />

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <div className="shop-grid">

          {filtered.length === 0 ? (

            <p className="shop-empty">
              No sarees match your filters.
              Try adjusting them.
            </p>

          ) : (

            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))

          )}

        </div>

      </div>

    </div>
  )
}