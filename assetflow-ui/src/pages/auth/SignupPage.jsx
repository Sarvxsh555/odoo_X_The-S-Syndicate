import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, UserPlus, Moon, RotateCcw, Power } from 'lucide-react'
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

  const inputStyle = (error) => ({
    width: '100%', padding: '10px 16px', borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.1)',
    border: error ? '1px solid rgba(255, 69, 58, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white', fontSize: 13, outline: 'none',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    textAlign: 'center'
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top right, #5c2c7f, #1e1136 50%, #000000)',
      backgroundAttachment: 'fixed', position: 'relative', overflow: 'hidden',
      color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      padding: 24
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 360, zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <UserPlus size={36} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.5px' }}>
            New Account
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <div style={{ width: '100%' }}>
              <input {...register('firstName')} placeholder="First Name" style={inputStyle(errors.firstName)} />
            </div>
            <div style={{ width: '100%' }}>
              <input {...register('lastName')} placeholder="Last Name" style={inputStyle(errors.lastName)} />
            </div>
          </div>
          
          <div style={{ width: '100%' }}>
            <input {...register('email')} type="email" placeholder="Email address" style={inputStyle(errors.email)} />
          </div>

          <div style={{ width: '100%' }}>
            <input {...register('password')} type="password" placeholder="Password (8+ chars)" style={inputStyle(errors.password)} />
          </div>

          <div style={{ width: '100%', position: 'relative' }}>
            <input {...register('confirmPassword')} type="password" placeholder="Verify Password" 
                   style={{ ...inputStyle(errors.confirmPassword), paddingRight: 36 }} />
            <button
              type="submit" disabled={isLoading}
              style={{
                position: 'absolute', right: 6, top: 6, bottom: 6, width: 26,
                borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', padding: 0
              }}
            >
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          <div style={{ minHeight: 20, marginTop: 4 }}>
            {Object.keys(errors).length > 0 && (
              <p style={{ color: '#ff453a', fontSize: 12, textAlign: 'center', margin: 0, fontWeight: 500 }}>
                {Object.values(errors)[0]?.message || 'Sign up failed'}
              </p>
            )}
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </motion.div>

      {/* macOS Bottom Controls */}
      <div style={{ position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 48, display: 'none' }}>
        {/* Hidden on signup for simplicity, or could include same controls as login */}
      </div>
    </div>
  )
}
