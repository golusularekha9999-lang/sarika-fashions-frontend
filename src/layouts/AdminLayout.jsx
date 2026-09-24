import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers3,
  LogOut,
  Store,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react'

import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import './AdminLayout.css'

export default function AdminLayout() {
  const navigate = useNavigate()

  const { admin, logout } = useAdminAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Products',
      path: '/admin/products',
      icon: Package,
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Return Requests',
      path: '/admin/returns',
      icon: RotateCcw,
    },
    {
      label: 'Customers',
      path: '/admin/customers',
      icon: Users,
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: Layers3,
    },
  ]

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNavigation = (path) => {
    navigate(path)
    closeSidebar()
  }

  const handleStore = () => {
    navigate('/')
    closeSidebar()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      navigate('/admin/login', { replace: true })
      closeSidebar()
    }
  }

  return (
    <div className="admin-layout">

      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}

      <header className="admin-mobile-header">

        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin menu"
        >
          <Menu size={23} />
        </button>

        <div className="admin-mobile-brand">
          <span className="admin-mobile-brand-main">
            Sarika
          </span>

          <span className="admin-mobile-brand-sub">
            FASHIONS
          </span>
        </div>

        <span className="admin-mobile-label">
          ADMIN
        </span>

      </header>


      {/* =====================================================
          SIDEBAR OVERLAY - MOBILE
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? 'is-open' : ''
        }`}
      >

        {/* ================= LOGO ================= */}

        <div className="admin-sidebar-logo">

          <div className="admin-logo-circle">
            SF
          </div>

          <div className="admin-logo-text">

            <h2>Sarika</h2>

            <span>
              FASHIONS
            </span>

          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close admin menu"
          >
            <X size={21} />
          </button>

        </div>


        {/* ================= ADMIN ACCOUNT ================= */}

        <div className="admin-user-box">

          <div className="admin-user-avatar">
            A
          </div>

          <div className="admin-user-details">

            <strong>
              Administrator
            </strong>

            <span>
              {admin?.email || 'Admin'}
            </span>

          </div>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="admin-sidebar-nav">

          <p className="admin-nav-title">
            MANAGEMENT
          </p>

          {menuItems.map((item) => {

            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? 'active' : ''
                  }`
                }
              >

                <Icon size={19} />

                <span>
                  {item.label}
                </span>

              </NavLink>
            )
          })}

        </nav>


        {/* ================= SIDEBAR BOTTOM ================= */}

        <div className="admin-sidebar-bottom">

          {/* VIEW STORE */}

          <button
            type="button"
            className="admin-store-btn"
            onClick={handleStore}
          >

            <Store size={18} />

            <span>
              View Store
            </span>

          </button>


          {/* LOGOUT */}

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN ADMIN CONTENT
      ====================================================== */}

      <main className="admin-main">

        <Outlet />

      </main>

    </div>
  )
}