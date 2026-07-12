import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[!@#$%^&*]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

export default function SignupPage() {
  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const { confirmPassword, ...submitData } = data
    const result = await signup(submitData)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gradient-hero)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-violet)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
            <Zap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Start managing your assets efficiently</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input {...register('firstName')} className={`input ${errors.firstName ? 'error' : ''}`} style={{ paddingLeft: 36 }} placeholder="John" />
                </div>
                {errors.firstName && <div className="form-error">{errors.firstName.message}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input {...register('lastName')} className={`input ${errors.lastName ? 'error' : ''}`} placeholder="Doe" />
                {errors.lastName && <div className="form-error">{errors.lastName.message}</div>}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input {...register('email')} type="email" className={`input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 36 }} placeholder="you@company.com" />
              </div>
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input {...register('password')} type="password" className={`input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 36 }} placeholder="8+ characters" />
              </div>
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className={`input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Re-enter password" />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword.message}</div>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Creating account...' : <> Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent-violet-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
