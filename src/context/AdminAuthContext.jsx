import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const AdminAuthContext = createContext(null)

// ============================================================
// ONE API BASE FOR THE WHOLE ADMIN PANEL
// ============================================================

const API_BASE =
  `${import.meta.env.VITE_API_URL}`

export { API_BASE }

// ============================================================
// ADMIN AUTH PROVIDER
// ============================================================

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================================
  // CHECK ADMIN SESSION
  // ==========================================================

  const checkAdmin = async () => {
    try {
      console.log('🔎 CHECKING ADMIN SESSION...')

      const response = await fetch(
        `${API_BASE}/admin/me`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const data =
        await response.json().catch(() => ({}))

      console.log(
        '🔎 ADMIN SESSION RESPONSE:',
        response.status,
        data
      )

      if (
        response.ok &&
        data.success === true &&
        data.admin
      ) {
        console.log(
          '✅ ADMIN SESSION VALID:',
          data.admin.email
        )

        setAdmin(data.admin)

        return data.admin
      }

      console.log(
        '❌ NO VALID ADMIN SESSION'
      )

      setAdmin(null)

      return null

    } catch (error) {

      console.error(
        '❌ ADMIN SESSION CHECK FAILED:',
        error
      )

      setAdmin(null)

      return null

    } finally {

      setLoading(false)
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email,
    password
  ) => {

    try {

      console.log(
        '🔐 ADMIN LOGIN ATTEMPT:',
        email
      )

      const response = await fetch(
        `${API_BASE}/admin/login`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body: JSON.stringify({
            email:
              email.trim(),

            password,
          }),
        }
      )

      const data =
        await response.json().catch(() => ({}))

      console.log(
        '🔐 LOGIN RESPONSE:',
        response.status,
        data
      )

      if (
        !response.ok ||
        data.success !== true
      ) {

        return {
          success: false,

          message:
            data.message ||
            'Invalid email or password.',
        }
      }

      // ------------------------------------------------------
      // STORE ADMIN
      // ------------------------------------------------------

      if (data.admin) {

        setAdmin(data.admin)

      } else {

        await checkAdmin()
      }

      console.log(
        '✅ ADMIN LOGIN SUCCESSFUL'
      )

      return {

        success: true,

        admin:
          data.admin || null,

        message:
          data.message ||
          'Login successful.',
      }

    } catch (error) {

      console.error(
        '❌ ADMIN LOGIN ERROR:',
        error
      )

      return {

        success: false,

        message:
          'Cannot connect to the server. Make sure Flask backend is running on port 5000.',
      }
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {

    try {

      await fetch(
        `${API_BASE}/admin/logout`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            Accept:
              'application/json',
          },
        }
      )

    } catch (error) {

      console.error(
        '❌ Logout request failed:',
        error
      )

    } finally {

      setAdmin(null)
    }
  }

  // ==========================================================
  // INITIAL SESSION CHECK
  // ==========================================================

  useEffect(() => {

    checkAdmin()

  }, [])

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    admin,

    loading,

    isAdmin:
      !!admin,

    login,

    logout,

    checkAdmin,
  }

  return (
    <AdminAuthContext.Provider
      value={value}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useAdminAuth() {

  const context =
    useContext(AdminAuthContext)

  if (!context) {

    throw new Error(
      'useAdminAuth must be used inside AdminAuthProvider'
    )
  }

  return context
}
