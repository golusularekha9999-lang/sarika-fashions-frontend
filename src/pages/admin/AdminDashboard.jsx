
import React, { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Boxes,
  Layers3,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  Users,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import './AdminDashboard.css'

const API_BASE = `http://${window.location.hostname}:5000/api`

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE}/products`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load products.'
        )
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      )
    } catch (err) {
      console.error('Dashboard products error:', err)
      setError('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // INVENTORY CALCULATIONS
  // =========================

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  )

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0)
    return stock > 0 && stock <= 5
  })

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) === 0
  )

  const inStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) > 5
  )

  // =========================
  // CATEGORIES
  // =========================

  const categories = useMemo(() => {
    const categoryMap = {}

    products.forEach((product) => {
      let category = product.category

      if (
        typeof category === 'object' &&
        category !== null
      ) {
        category = category.name
      }

      category = String(
        category || 'Other'
      ).trim()

      if (!categoryMap[category]) {
        categoryMap[category] = 0
      }

      categoryMap[category] += 1
    })

    return Object.entries(categoryMap)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  // =========================
  // STOCK STATUS
  // =========================

  const inventoryPercentage =
    totalProducts > 0
      ? Math.round(
          (inStockProducts.length /
            totalProducts) *
            100
        )
      : 0

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-dashboard">

        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h3>Loading dashboard...</h3>

          <p>
            Getting your store information ready.
          </p>
        </div>

      </div>
    )
  }

  return (
    <div className="admin-dashboard">

      {/* =================================
          HEADER
      ================================= */}

      <div className="dashboard-header">

        <div>
          <span className="dashboard-eyebrow">
            SARIKA FASHIONS
          </span>

          <h1 className="section-title">
            Hello,Illapuram Madhu Sarika ✨
          </h1>

          <p className="admin-dashboard-subtitle">
            Here's what's happening with your
            store today.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchProducts}
          type="button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =================================
          MAIN STATS
      ================================= */}

      <div className="dashboard-stats">

        <div className="dashboard-stat-card primary">
          <div className="dashboard-stat-icon">
            <Package size={21} />
          </div>

          <div className="dashboard-stat-content">
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
            <small>
              Products in your catalogue
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <Boxes size={21} />
          </div>

          <div className="dashboard-stat-content">
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
            <small>
              Items currently available
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <Layers3 size={21} />
          </div>

          <div className="dashboard-stat-content">
            <span>Collections</span>
            <strong>{categories.length}</strong>
            <small>
              Active product categories
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card warning">
          <div className="dashboard-stat-icon">
            <AlertTriangle size={21} />
          </div>

          <div className="dashboard-stat-content">
            <span>Low Stock</span>
            <strong>
              {lowStockProducts.length}
            </strong>
            <small>
              Need your attention
            </small>
          </div>
        </div>

      </div>

      {/* =================================
          QUICK ACTIONS
      ================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>
              Manage your store from here.
            </p>
          </div>
        </div>

        <div className="quick-actions">

          <Link
            to="/admin/products"
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <Plus size={20} />
            </div>

            <div>
              <strong>
                Manage Products
              </strong>

              <span>
                Add, edit or remove sarees
              </span>
            </div>

            <ArrowRight size={18} />
          </Link>

          <Link
            to="/admin/orders"
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <strong>
                View Orders
              </strong>

              <span>
                Check and manage customer orders
              </span>
            </div>

            <ArrowRight size={18} />
          </Link>

          <Link
            to="/admin/customers"
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <Users size={20} />
            </div>

            <div>
              <strong>
                Customers
              </strong>

              <span>
                View your customer information
              </span>
            </div>

            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

      {/* =================================
          INVENTORY + STOCK ALERT
      ================================= */}

      <div className="dashboard-two-column">

        {/* INVENTORY OVERVIEW */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Inventory Overview
              </h2>

              <p>
                Current product availability
              </p>
            </div>

            <Boxes size={20} />

          </div>

          <div className="inventory-progress">

            <div className="inventory-progress-top">
              <span>
                Products comfortably in stock
              </span>

              <strong>
                {inventoryPercentage}%
              </strong>
            </div>

            <div className="inventory-bar">
              <div
                className="inventory-bar-fill"
                style={{
                  width: `${inventoryPercentage}%`,
                }}
              />
            </div>

          </div>

          <div className="inventory-items">

            <div>
              <span className="inventory-dot available" />
              <span>Healthy stock</span>
              <strong>
                {inStockProducts.length}
              </strong>
            </div>

            <div>
              <span className="inventory-dot low" />
              <span>Low stock</span>
              <strong>
                {lowStockProducts.length}
              </strong>
            </div>

            <div>
              <span className="inventory-dot empty" />
              <span>Out of stock</span>
              <strong>
                {outOfStockProducts.length}
              </strong>
            </div>

          </div>

        </section>

        {/* STOCK ALERT */}

        <section className="dashboard-panel stock-alert-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Stock Alerts
              </h2>

              <p>
                Products needing attention
              </p>
            </div>

            <AlertTriangle size={20} />

          </div>

          {lowStockProducts.length === 0 &&
          outOfStockProducts.length === 0 ? (

            <div className="stock-all-good">

              <div className="stock-good-icon">
                ✓
              </div>

              <strong>
                Everything looks good!
              </strong>

              <span>
                No products are running low
                on stock.
              </span>

            </div>

          ) : (

            <div className="stock-alert-list">

              {[
                ...outOfStockProducts,
                ...lowStockProducts,
              ]
                .slice(0, 5)
                .map((product) => {

                  const stock =
                    Number(product.stock || 0)

                  return (
                    <div
                      className="stock-alert-item"
                      key={product.id}
                    >

                      <div className="stock-product-image">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <Package size={18} />
                        )}

                      </div>

                      <div className="stock-product-info">

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          {stock === 0
                            ? 'Out of stock'
                            : `${stock} left`}
                        </span>

                      </div>

                      <span
                        className={
                          stock === 0
                            ? 'stock-badge danger'
                            : 'stock-badge warning'
                        }
                      >
                        {stock === 0
                          ? 'OUT'
                          : 'LOW'}
                      </span>

                    </div>
                  )
                })}

            </div>

          )}

        </section>

      </div>

      {/* =================================
          COLLECTIONS
      ================================= */}

      <section className="dashboard-section collections-section">

        <div className="dashboard-section-heading">

          <div>
            <h2>
              Your Collections
            </h2>

            <p>
              Product distribution across
              your saree collections.
            </p>
          </div>

          <Link
            to="/admin/categories"
            className="dashboard-view-link"
          >
            View all
            <ArrowRight size={16} />
          </Link>

        </div>

        <div className="collection-grid">

          {categories.map((category) => {

            const percentage =
              totalProducts > 0
                ? Math.round(
                    (category.count /
                      totalProducts) *
                      100
                  )
                : 0

            return (
              <div
                className="collection-card"
                key={category.name}
              >

                <div className="collection-card-top">

                  <div className="collection-icon">
                    <Layers3 size={18} />
                  </div>

                  <span>
                    {percentage}%
                  </span>

                </div>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.count}{' '}
                  {category.count === 1
                    ? 'product'
                    : 'products'}
                </p>

                <div className="collection-mini-bar">
                  <div
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

              </div>
            )
          })}

        </div>

      </section>

    </div>
  )
}

