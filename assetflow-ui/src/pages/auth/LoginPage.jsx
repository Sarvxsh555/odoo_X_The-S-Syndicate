import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Power, RotateCcw, Moon, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ParticleBackground from '../../components/ui/ParticleBackground'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      // macOS Sonoma/Ventura inspired dark abstract background
      background: 'radial-gradient(ellipse at 30% 20%, #3b1f6e 0%, #100b22 45%, #000000 100%)',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 320, zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {/* macOS Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <User size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.5px' }}>
            AssetFlow
          </h1>
        </div>

        {/* Login Form mimicking macOS password input */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          
          <div style={{ width: '100%', position: 'relative' }}>
            <input
              {...register('email')}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.1)',
                border: errors.email ? '1px solid rgba(255, 69, 58, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white', fontSize: 13, outline: 'none',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}
            />
          </div>

          <div style={{ width: '100%', position: 'relative' }}>
            <input
              {...register('password')}
              type="password"
              placeholder="Enter Password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 36px 10px 16px', borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.1)',
                border: errors.password ? '1px solid rgba(255, 69, 58, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white', fontSize: 13, outline: 'none',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                position: 'absolute', right: 6, top: 6, bottom: 6, width: 26,
                borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white', padding: 0
              }}
            >
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          <div style={{ minHeight: 20 }}>
            {(errors.email || errors.password) && (
              <p style={{ color: '#ff453a', fontSize: 12, textAlign: 'center', margin: 0, fontWeight: 500 }}>
                {errors.email?.message || errors.password?.message || 'Login failed'}
              </p>
            )}
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/signup" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </motion.div>

      {/* macOS Bottom Controls */}
      <div style={{
        position: 'absolute', bottom: 40, width: '100%',
        display: 'flex', justifyContent: 'center', gap: 48
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <Moon size={18} color="white" strokeWidth={1.5} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Sleep</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <RotateCcw size={18} color="white" strokeWidth={1.5} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Restart</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <Power size={18} color="white" strokeWidth={1.5} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Shut Down</span>
        </div>
      </div>
    </div>
  )
}
