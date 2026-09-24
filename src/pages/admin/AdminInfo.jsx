import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Users,
  Tags,
  Settings,
  Search,
  RefreshCw,
} from 'lucide-react'

import {
  useLocation,
  Link,
} from 'react-router-dom'

import {
  categories,
} from '../../data/products.js'

import {
  API_BASE,
} from '../../context/AdminAuthContext.jsx'

import './AdminInfo.css'

export default function AdminInfo() {

  const location =
    useLocation()

  const path =
    location.pathname

  // ==========================================================
  // CUSTOMER STATE
  // ==========================================================

  const [orders, setOrders] =
    useState([])

  const [
    loadingCustomers,
    setLoadingCustomers,
  ] = useState(false)

  const [
    customerError,
    setCustomerError,
  ] = useState('')

  const [search, setSearch] =
    useState('')

  // ==========================================================
  // FETCH CUSTOMER DATA
  // ==========================================================

  const fetchCustomers =
    async () => {

      try {

        setLoadingCustomers(true)

        setCustomerError('')

        console.log(
          '👥 FETCHING CUSTOMER ORDERS:',
          `${API_BASE}/orders`
        )

        const response =
          await fetch(
            `${API_BASE}/orders`,
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
          '👥 CUSTOMER RESPONSE:',
          response.status,
          data
        )

        // ----------------------------------------------------
        // SESSION EXPIRED
        // ----------------------------------------------------

        if (
          response.status === 401
        ) {

          setOrders([])

          setCustomerError(
            'Admin session expired. Please login again.'
          )

          return
        }

        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

          throw new Error(
            data.message ||
            data.error ||
            'Failed to fetch customers'
          )
        }

        // ----------------------------------------------------
        // VALID RESPONSE
        // ----------------------------------------------------

        const orderList =
          Array.isArray(
            data.orders
          )
            ? data.orders
            : []

        setOrders(
          orderList
        )

        console.log(
          `✅ ${orderList.length} orders loaded for customers`
        )

      } catch (error) {

        console.error(
          '❌ CUSTOMER FETCH ERROR:',
          error
        )

        setOrders([])

        setCustomerError(
          error.message ||
          'Unable to load customers.'
        )

      } finally {

        setLoadingCustomers(false)
      }
    }

  // ==========================================================
  // LOAD ONLY ON CUSTOMERS PAGE
  // ==========================================================

  useEffect(() => {

    if (
      path.endsWith(
        '/customers'
      )
    ) {

      fetchCustomers()
    }

  }, [path])

  // ==========================================================
  // BUILD CUSTOMER LIST
  // ==========================================================

  const customers =
    useMemo(() => {

      const customerMap =
        {}

      orders.forEach(
        (order) => {

          const email =
            (
              order.customer_email ||
              ''
            )
              .trim()
              .toLowerCase()

          const phone =
            (
              order.customer_phone ||
              ''
            ).trim()

          const name =
            (
              order.customer_name ||
              'Guest Customer'
            ).trim()

          const customerKey =
            email ||
            phone ||
            name.toLowerCase()

          if (
            !customerMap[
              customerKey
            ]
          ) {

            customerMap[
              customerKey
            ] = {

              id:
                customerKey,

              name,

              email:
                order.customer_email ||
                '—',

              phone:
                order.customer_phone ||
                '—',

              orders: 0,

              totalSpent: 0,
            }
          }

          customerMap[
            customerKey
          ].orders += 1

          const isPaid =
            String(
              order.payment_status ||
              ''
            ).toLowerCase() ===
            'paid'

          const isCancelled =
            String(
              order.order_status ||
              ''
            ).toLowerCase() ===
            'cancelled'

          if (
            isPaid &&
            !isCancelled
          ) {

            customerMap[
              customerKey
            ].totalSpent +=
              Number(
                order.total ||
                order.total_amount ||
                0
              )
          }

        }
      )

      return Object.values(
        customerMap
      )

    }, [orders])

  // ==========================================================
  // SEARCH CUSTOMERS
  // ==========================================================

  const filteredCustomers =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return customers
      }

      return customers.filter(
        (customer) =>

          customer.name
            .toLowerCase()
            .includes(query) ||

          customer.email
            .toLowerCase()
            .includes(query) ||

          customer.phone
            .toLowerCase()
            .includes(query)
      )

    }, [
      customers,
      search,
    ])

  // ==========================================================
  // CUSTOMERS PAGE
  // ==========================================================

  if (
    path.endsWith(
      '/customers'
    )
  ) {

    return (

      <div className="admin-info">

        {/* HEADER */}

        <div
          className="admin-info-header"
        >

          <div>

            <h1
              className="section-title"
            >
              Customers
            </h1>

            <p
              className="admin-info-sub"
            >
              View customers from
              your real orders.
            </p>

          </div>

          <button
            className="customer-refresh-btn"
            onClick={
              fetchCustomers
            }
            type="button"
            disabled={
              loadingCustomers
            }
          >

            <RefreshCw
              size={16}
            />

            {loadingCustomers
              ? 'Loading...'
              : 'Refresh'}

          </button>

        </div>

        {/* SUMMARY */}

        <div
          className="customer-summary"
        >

          <div
            className="customer-summary-card"
          >

            <Users
              size={20}
            />

            <div>

              <span>
                Total Customers
              </span>

              <strong>
                {customers.length}
              </strong>

            </div>

          </div>

          <div
            className="customer-summary-card"
          >

            <span
              className="rupee-icon"
            >
              ₹
            </span>

            <div>

              <span>
                Total Customer Spending
              </span>

              <strong>
                ₹
                {customers
                  .reduce(
                    (
                      sum,
                      customer
                    ) =>
                      sum +
                      customer.totalSpent,
                    0
                  )
                  .toLocaleString(
                    'en-IN'
                  )}
              </strong>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div
          className="customer-search"
        >

          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search customer by name, email or phone..."
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        {/* TABLE CARD */}

        <div
          className="admin-table-card"
        >

          {/* LOADING */}

          {loadingCustomers && (

            <div
              className="customer-empty"
            >

              <p>
                Loading customers...
              </p>

            </div>

          )}

          {/* ERROR */}

          {!loadingCustomers &&
            customerError && (

              <div
                className="customer-empty"
              >

                <Users
                  size={40}
                />

                <h3>
                  Unable to load customers
                </h3>

                <p>
                  {customerError}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={
                    fetchCustomers
                  }
                >
                  Try Again
                </button>

              </div>

            )}

          {/* NO CUSTOMERS */}

          {!loadingCustomers &&
            !customerError &&
            customers.length ===
              0 && (

              <div
                className="customer-empty"
              >

                <Users
                  size={40}
                />

                <h3>
                  No customers yet
                </h3>

                <p>
                  Customers will
                  automatically appear
                  here when orders are
                  placed.
                </p>

              </div>

            )}

          {/* NO SEARCH RESULTS */}

          {!loadingCustomers &&
            !customerError &&
            customers.length >
              0 &&
            filteredCustomers.length ===
              0 && (

              <div
                className="customer-empty"
              >

                <Search
                  size={40}
                />

                <h3>
                  No customers found
                </h3>

                <p>
                  Try a different name,
                  email or phone number.
                </p>

              </div>

            )}

          {/* CUSTOMER TABLE */}

          {!loadingCustomers &&
            !customerError &&
            filteredCustomers.length >
              0 && (

              <div
                className="admin-table-scroll"
              >

                <table>

                  <thead>

                    <tr>

                      <th>
                        Name
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Phone
                      </th>

                      <th>
                        Orders
                      </th>

                      <th>
                        Total Spent
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredCustomers.map(
                      (
                        customer
                      ) => (

                        <tr
                          key={
                            customer.id
                          }
                        >

                          <td>

                            <div
                              className="customer-name"
                            >

                              <div
                                className="customer-avatar"
                              >
                                {customer.name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                            </div>

                          </td>

                          <td>
                            {
                              customer.email
                            }
                          </td>

                          <td>
                            {
                              customer.phone
                            }
                          </td>

                          <td>
                            {
                              customer.orders
                            }
                          </td>

                          <td>

                            <strong>
                              ₹
                              {customer.totalSpent.toLocaleString(
                                'en-IN'
                              )}
                            </strong>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </div>

      </div>

    )
  }

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  if (
    path.endsWith(
      '/categories'
    )
  ) {

    return (

      <div className="admin-info">

        <h1
          className="section-title"
        >
          Categories
        </h1>

        <p
          className="admin-info-sub"
        >
          Organize your storefront
          categories.
        </p>

        <div
          className="admin-category-cards"
        >

          {categories.map(
            (category) => (

              <div
                className="admin-category-card"
                key={
                  category.id
                }
              >

                <Tags
                  size={18}
                />

                <div>

                  <strong>
                    {category.name}
                  </strong>

                  <span>
                    Active collection
                  </span>

                </div>

                <Link
                  to={`/shop?category=${category.id}`}
                >
                  View
                </Link>

              </div>

            )
          )}

        </div>

      </div>

    )
  }

  // ==========================================================
  // SETTINGS
  // ==========================================================

  return (

    <div className="admin-info">

      <h1
        className="section-title"
      >
        Store Settings
      </h1>

      <p
        className="admin-info-sub"
      >
        These settings are ready to
        connect to the backend.
      </p>

      <div
        className="settings-card"
      >

        <Settings
          size={22}
        />

        <div className="field">

          <label>
            Store Name
          </label>

          <input
            defaultValue="Sarika Fashions"
          />

        </div>

        <div className="field">

          <label>
            Support Email
          </label>

          <input
            defaultValue="hello@sarikafashions.com"
          />

        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            alert(
              'Settings saved for this frontend preview.'
            )
          }
        >
          Save Settings
        </button>

      </div>

    </div>

  )
}