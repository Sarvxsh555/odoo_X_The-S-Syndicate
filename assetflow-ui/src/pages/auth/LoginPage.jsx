import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--gradient-hero)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--gradient-violet)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            }}>
              <Zap size={28} color="white" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'Outfit' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
              Sign in to your AssetFlow workspace
            </p>
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: 32 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input
                    {...register('email')}
                    className={`input ${errors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 38 }}
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <div className="form-error">{errors.email.message}</div>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--color-accent-violet-light)' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input
                    {...register('password')}
                    className={`input ${errors.password ? 'error' : ''}`}
                    style={{ paddingLeft: 38, paddingRight: 44 }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <div className="form-error">{errors.password.message}</div>}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Signing in...' : (
                  <>Sign in <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="divider" style={{ margin: '24px 0' }} />
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--color-accent-violet-light)', fontWeight: 600 }}>
                Create one
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--color-text-disabled)' }}>
            Default admin: admin@assetflow.com / Admin@123
          </p>
        </motion.div>
      </div>
    </div>
  )
}
