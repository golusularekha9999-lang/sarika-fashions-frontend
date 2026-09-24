import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      if (result.success) {
        const from = location.state?.from?.pathname || '/admin'
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'Invalid email or password.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <style>{`
      .admin-login-page{
        min-height:100vh;background:#f6efeb;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Poppins,sans-serif;
      }
      .admin-login-card{
        background:#fff;width:100%;max-width:420px;border-radius:24px;padding:36px 32px 28px;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #f0e6df;
      }
      .admin-login-icon{
        width:72px;height:72px;background:#2b211e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;color:#fff;
      }
      .admin-login-card h1{text-align:center;font-size:32px;font-weight:700;color:#2b211e;margin:0 0 6px;}
      .subtitle{text-align:center;font-size:14px;color:#8a7e7a;margin-bottom:28px;}
      .admin-login-card label{display:block;font-size:14px;font-weight:600;color:#2b211e;margin:18px 0 8px;}
      .input-group{
        position:relative;display:flex;align-items:center;background:#fff;border:1.5px solid #e8ddd6;border-radius:12px;padding:0 14px;
      }
      .input-group:focus-within{border-color:#2b211e;}
      .input-group input{flex:1;border:none;outline:none;padding:14px 10px;font-size:14px;color:#333;background:transparent;}
      .icon-left,.icon-right{color:#9a8f8a;display:flex;cursor:pointer;}
      .btn-signin{
        width:100%;background:#2b211e;color:#fff;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:600;margin-top:24px;cursor:pointer;
      }
      .error-box{background:#fff0f0;color:#c62828;border:1px solid #f2b8b8;padding:12px;border-radius:8px;margin-bottom:15px;font-size:13px;}
      .secure-text{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:22px;font-size:13px;color:#8a7e7a;}
    `}</style>

    <div className="admin-login-page">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <div className="admin-login-icon"><ShieldCheck size={34} /></div>
        <h1>Admin Login</h1>
        <p className="subtitle">Sign in to manage Sarika Fashions</p>
        {error && <div className="error-box">{error}</div>}

        <label>Admin Email</label>
        <div className="input-group">
          <span className="icon-left"><Mail size={20} /></span>
          <input type="email" placeholder="Enter admin email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
        </div>

        <label>Password</label>
        <div className="input-group">
          <span className="icon-left"><Lock size={20} /></span>
          <input type={showPassword ? 'text' : 'password'} placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
          <span className="icon-right" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button type="submit" className="btn-signin" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="secure-text"><ShieldCheck size={18}/> Secure administrator access</div>
      </form>
    </div>
    </>
  )
}