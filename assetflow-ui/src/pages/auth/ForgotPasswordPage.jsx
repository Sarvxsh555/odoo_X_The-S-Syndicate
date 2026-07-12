import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authApi } from '../../api/services'
import { useState } from 'react'
import toast from 'react-hot-toast'

const schema = z.object({ email: z.string().email('Valid email required') })

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data)
      setSent(true)
    } catch (e) {
      toast.error(e?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gradient-hero)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-violet)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
            <Zap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 8 }}>Reset password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>We'll send you a link to reset your password</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={48} color="var(--color-accent-emerald)" style={{ marginBottom: 16 }} />
              <h3 style={{ marginBottom: 8, fontSize: 18 }}>Check your email</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                We've sent a password reset link. It expires in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input {...register('email')} type="email" className={`input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 36 }} placeholder="you@company.com" />
                </div>
                {errors.email && <div className="form-error">{errors.email.message}</div>}
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="divider" style={{ margin: '24px 0' }} />
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
