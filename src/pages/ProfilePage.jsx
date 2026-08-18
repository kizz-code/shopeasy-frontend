import { useState } from 'react'
import toast from 'react-hot-toast'
import { User, Lock, MapPin, Plus, Trash2, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/30 grid place-items-center text-brand-400 text-xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-dark-400 text-sm">{user?.email}</p>
        </div>
      </header>

      <div role="tablist" className="flex gap-2 border-b border-dark-600 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors
              ${tab === id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-dark-400 hover:text-white'}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileForm user={user} onSaved={updateUser} />}
      {tab === 'password' && <PasswordForm />}
      {tab === 'addresses' && <AddressList user={user} onSaved={updateUser} />}
    </div>
  )
}

function ProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const { user: updated } = await authService.updateProfile(form)
      onSaved(updated)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-1.5">Full name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-dark-300 mb-1.5">Phone</label>
        <input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input-field"
          maxLength={10}
          inputMode="numeric"
          placeholder="9876543210"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
        <input id="email" value={user?.email || ''} className="input-field opacity-60" disabled />
        <p className="text-dark-500 text-xs mt-1">Email cannot be changed.</p>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' }
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('The two new passwords do not match')
      return
    }

    setError('')
    setSaving(true)
    try {
      // The backend returns a fresh token, so the session survives the change.
      const { token } = await authService.changePassword(form.currentPassword, form.newPassword)
      localStorage.setItem('token', token)
      setForm(empty)
      toast.success('Password changed')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4 max-w-lg">
      {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-dark-300 mb-1.5">
            {field === 'currentPassword' ? 'Current password'
              : field === 'newPassword' ? 'New password' : 'Confirm new password'}
          </label>
          <input
            id={field}
            type="password"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="input-field"
            required
          />
        </div>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Updating…' : 'Change password'}
      </button>
    </form>
  )
}

const emptyAddress = { label: 'Home', street: '', city: '', state: '', pincode: '', country: 'India' }

function AddressList({ user, onSaved }) {
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const sync = (updated) => {
    setAddresses(updated)
    onSaved({ ...user, addresses: updated })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const { addresses: updated } = form._id
        ? await authService.updateAddress(form._id, form)
        : await authService.addAddress(form)
      sync(updated)
      setForm(null)
      toast.success('Address saved')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      const { addresses: updated } = await authService.deleteAddress(id)
      sync(updated)
      toast.success('Address removed')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const makeDefault = async (address) => {
    try {
      const { addresses: updated } = await authService.updateAddress(address._id, {
        ...address,
        isDefault: true,
      })
      sync(updated)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !form && (
        <p className="text-dark-400 text-sm">You have not saved any addresses yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div key={address._id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-white font-medium text-sm">{address.label}</span>
              {address.isDefault ? (
                <span className="text-xs text-brand-400 flex items-center gap-1">
                  <Star size={11} className="fill-brand-400" /> Default
                </span>
              ) : (
                <button onClick={() => makeDefault(address)} className="text-xs text-dark-400 hover:text-brand-400">
                  Make default
                </button>
              )}
            </div>

            <p className="text-dark-300 text-sm">{address.street}</p>
            <p className="text-dark-400 text-sm">
              {address.city}, {address.state} — {address.pincode}
            </p>

            <div className="flex gap-3 mt-3 pt-3 border-t border-dark-600">
              <button onClick={() => setForm(address)} className="text-xs text-brand-400 hover:text-brand-300">
                Edit
              </button>
              <button
                onClick={() => remove(address._id)}
                className="text-xs text-dark-400 hover:text-red-400 flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {form ? (
        <form onSubmit={submit} className="glass-card p-6 space-y-4 max-w-lg">
          <h3 className="font-bold text-white">{form._id ? 'Edit address' : 'New address'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input-field" placeholder="Label (Home, Work)" aria-label="Label"
            />
            <input
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="input-field" placeholder="PIN code" aria-label="PIN code" maxLength={6} required
            />
          </div>

          <input
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="input-field" placeholder="Street address" aria-label="Street address" required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input-field" placeholder="City" aria-label="City" required
            />
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="input-field" placeholder="State" aria-label="State" required
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setForm({ ...emptyAddress })} className="btn-secondary flex items-center gap-2">
          <Plus size={16} />
          Add address
        </button>
      )}
    </div>
  )
}
