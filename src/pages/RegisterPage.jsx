import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const { fetchCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      await fetchCart()
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone Number (Optional)', type: 'tel', icon: Phone, placeholder: '9876543210' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl mb-4">
            <UserPlus size={28} className="text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400">Join ShopEasy and start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
              <div className="relative">
                <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`input-field pl-11 ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
                />
              </div>
              {errors[name] && <p className="text-red-400 text-xs mt-1.5">{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`input-field pl-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
