import { useState } from 'react'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Cannot connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-card">

      <div className="auth-header">
        <div className="icon-wrapper">
          <Lock size={32} />
        </div>
        <h1>Welcome Back</h1>
        <p>Please enter your details to sign in</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 🔥 IMPORTANT CHANGE HERE */}
      <form onSubmit={handleSubmit} autoComplete="off">

        {/* Hidden fields to disable autofill */}
        <input type="text" style={{ display: "none" }} />
        <input type="password" style={{ display: "none" }} />

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"   /* 🔥 FIX */
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"  /* 🔥 FIX */
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="switch-mode">
        Don't have an account?
        <button type="button" onClick={onSwitchToRegister}>
          Sign up
        </button>
      </div>

    </div>
  )
}