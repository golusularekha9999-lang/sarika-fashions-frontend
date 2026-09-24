import React, {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import './AdminProducts.css'

import { API_BASE } from '../../context/AdminAuthContext.jsx'

export default function AdminProducts() {

  const navigate =
    useNavigate()

  const [products, setProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [deletingId, setDeletingId] =
    useState(null)

  const [error, setError] =
    useState('')

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  const loadProducts = async () => {

    try {

      setLoading(true)
      setError('')

      const response =
        await fetch(
          `${API_BASE}/products`,
          {
            method: 'GET',

            credentials:
              'include',

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
        '📦 PRODUCTS RESPONSE:',
        response.status,
        data
      )

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to load products'
        )
      }

      setProducts(
        Array.isArray(
          data.products
        )
          ? data.products
          : []
      )

    } catch (error) {

      console.error(
        '❌ LOAD PRODUCTS ERROR:',
        error
      )

      setError(
        error.message ||
        'Unable to load products.'
      )

    } finally {

      setLoading(false)
    }
  }

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this product?'
      )

    if (!confirmed) {
      return
    }

    try {

      setDeletingId(id)
      setError('')

      console.log(
        '🗑️ DELETE PRODUCT:',
        id
      )

      const response =
        await fetch(
          `${API_BASE}/products/${id}`,
          {
            method: 'DELETE',

            credentials:
              'include',

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
        '🗑️ DELETE RESPONSE:',
        response.status,
        data
      )

      // ------------------------------------------------------
      // SESSION ERROR
      // ------------------------------------------------------

      if (
        response.status === 401
      ) {

        throw new Error(
          'Admin session expired. Please login again.'
        )
      }

      // ------------------------------------------------------
      // OTHER ERROR
      // ------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Delete failed'
        )
      }

      // ------------------------------------------------------
      // REMOVE FROM UI
      // ------------------------------------------------------

      setProducts(
        (current) =>
          current.filter(
            (product) =>
              product.id !== id
          )
      )

      alert(
        'Product deleted successfully.'
      )

    } catch (error) {

      console.error(
        '❌ DELETE PRODUCT ERROR:',
        error
      )

      setError(
        error.message ||
        'Delete failed.'
      )

    } finally {

      setDeletingId(null)
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProducts()

  }, [])

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div
        style={{
          padding: 30,
        }}
      >
        Loading products...
      </div>

    )
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="admin-products-page">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div
        className="admin-products-header"
      >

        <div>

          <h2>
            Products ({products.length})
          </h2>

          {error && (

            <p
              style={{
                margin:
                  '8px 0 0',
                color:
                  '#c62828',
              }}
            >
              {error}
            </p>

          )}

        </div>

        <button
          onClick={() =>
            navigate(
              '/admin/products/add'
            )
          }
          className="add-btn"
        >
          + Add Product
        </button>

      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <div
        className="products-table-wrapper"
      >

        <table>

          <thead>

            <tr>

              <th>
                Image
              </th>

              <th>
                Name
              </th>

              <th>
                Price
              </th>

              <th>
                Category
              </th>

              <th>
                Stock
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign:
                      'center',
                    padding:
                      '30px',
                  }}
                >
                  No products found.
                </td>

              </tr>

            ) : (

              products.map(
                (product) => (

                  <tr
                    key={
                      product.id
                    }
                  >

                    {/* IMAGE */}

                    <td>

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name ||
                          'Product'
                        }
                        width="50"
                        height="50"
                        style={{
                          borderRadius:
                            6,
                          objectFit:
                            'cover',
                        }}
                      />

                    </td>

                    {/* NAME */}

                    <td>
                      {product.name}
                    </td>

                    {/* PRICE */}

                    <td>
                      ₹
                      {Number(
                        product.price ||
                        0
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {product.category}
                    </td>

                    {/* STOCK */}

                    <td>
                      {product.stock}
                    </td>

                    {/* ACTIONS */}

                    <td
                      style={{
                        display:
                          'flex',
                        gap: 8,
                      }}
                    >

                      <button
                        onClick={() =>
                          navigate(
                            `/admin/products/${product.id}/edit`
                          )
                        }
                        className="edit-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                        className="delete-btn"
                        disabled={
                          deletingId ===
                          product.id
                        }
                        style={{
                          opacity:
                            deletingId ===
                            product.id
                              ? 0.6
                              : 1,
                          cursor:
                            deletingId ===
                            product.id
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        {deletingId ===
                        product.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  )
}