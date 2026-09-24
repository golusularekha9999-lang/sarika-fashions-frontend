import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

export default function ProtectedRoute() {
  const {
    admin,
    loading,
  } = useAdminAuth()

  const location = useLocation()

  // =========================================================
  // WAIT FOR BACKEND TO CHECK SESSION
  // =========================================================
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff9f0',
          color: '#8e1748',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        Checking admin access...
      </div>
    )
  }

  // =========================================================
  // NO VALID ADMIN SESSION
  // =========================================================
  if (!admin) {
    console.log(
      '🔒 NO ADMIN SESSION → LOGIN REQUIRED'
    )

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  // =========================================================
  // VALID ADMIN SESSION
  // =========================================================
  console.log(
    '✅ VALID ADMIN SESSION:',
    admin.email
  )

  return <Outlet />
}