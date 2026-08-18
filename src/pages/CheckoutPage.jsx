import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapPin, Truck, CreditCard, ChevronRight, ShieldCheck, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderService, paymentService } from '../services/orderService'
import { formatPrice } from '../utils/format'
import { calculatePricing } from '../utils/pricing'

const STEPS = ['Shipping', 'Payment']

const emptyAddress = {
  name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India',
}

// Mirrors the express-validator rules on POST /api/orders. Checking here keeps the
// form responsive; the backend checks again because a browser can be bypassed.
function validateAddress(address) {
  const errors = {}
  if (!address.name.trim()) errors.name = 'Full name is required'
  if (!/^\d{10}$/.test(address.phone)) errors.phone = 'Enter a 10-digit phone number'
  if (!address.street.trim()) errors.street = 'Street address is required'
  if (!address.city.trim()) errors.city = 'City is required'
  if (!address.state.trim()) errors.state = 'State is required'
  if (!/^\d{6}$/.test(address.pincode)) errors.pincode = 'Enter a 6-digit PIN code'
  return errors
}

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [onlineEnabled, setOnlineEnabled] = useState(false)
  const [errors, setErrors] = useState({})

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  const [address, setAddress] = useState({
    ...emptyAddress,
    name: user?.name || '',
    phone: user?.phone || '',
    ...(defaultAddress && {
      street: defaultAddress.street || '',
      city: defaultAddress.city || '',
      state: defaultAddress.state || '',
      pincode: defaultAddress.pincode || '',
    }),
  })

  // Online payment only shows up if the server actually has Razorpay keys.
  useEffect(() => {
    paymentService
      .getConfig()
      .then(({ onlinePaymentEnabled }) => setOnlineEnabled(onlinePaymentEnabled))
      .catch(() => setOnlineEnabled(false))
  }, [])

  if (cart.items.length === 0 && !placing) {
    return <Navigate to="/cart" replace />
  }

  const pricing = calculatePricing(cart.totalPrice)

  const setField = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleShippingSubmit = (event) => {
    event.preventDefault()
    const found = validateAddress(address)
    setErrors(found)
    if (Object.keys(found).length === 0) setStep(1)
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      // This is the only call that creates an order. Cash on delivery is confirmed
      // immediately; an online order comes back as "pending" until payment clears.
      const order = await orderService.place(address, paymentMethod)

      if (paymentMethod === 'cod') {
        await refreshCart()
        toast.success('Order placed!')
        navigate(`/orders/${order._id}`, { replace: true })
        return
      }

      await payOnline(order)
    } catch (error) {
      toast.error(error.message)
      // Stock may have moved while the user was filling in the form.
      await refreshCart()
      setPlacing(false)
    }
  }

  const payOnline = async (order) => {
    if (!window.Razorpay) {
      toast.error('Payment gateway failed to load. Please refresh and try again.')
      setPlacing(false)
      return
    }

    const session = await paymentService.createOrder(order._id)

    const razorpay = new window.Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      name: 'ShopEasy',
      description: `Order ${order.orderNumber}`,
      order_id: session.razorpayOrderId,
      prefill: { name: address.name, email: user?.email, contact: address.phone },
      theme: { color: '#f17023' },
      handler: async (response) => {
        try {
          await paymentService.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id,
          })
          await refreshCart()
          toast.success('Payment successful!')
          navigate(`/orders/${order._id}`, { replace: true })
        } catch (error) {
          toast.error(error.message)
          navigate(`/orders/${order._id}`, { replace: true })
        }
      },
      modal: {
        // The order already exists at this point, so a dismissed popup leaves an
        // unpaid order the customer can pay for later from their order history.
        ondismiss: async () => {
          await paymentService.reportFailure(order._id, { description: 'cancelled by user' }).catch(() => {})
          await refreshCart()
          toast('Payment cancelled. Your order is saved as unpaid.')
          navigate(`/orders/${order._id}`, { replace: true })
        },
      },
    })

    razorpay.on('payment.failed', async (response) => {
      await paymentService.reportFailure(order._id, response.error).catch(() => {})
      toast.error(response.error?.description || 'Payment failed')
      setPlacing(false)
    })

    razorpay.open()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">
        Check<span className="gradient-text">out</span>
      </h1>
      <p className="text-dark-400 mb-8">Two steps and you are done.</p>

      <ol className="flex items-center mb-10">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold border-2 transition-colors
                  ${index < step
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : index === step
                      ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                      : 'border-dark-600 text-dark-500'}`}
              >
                {index < step ? <Check size={15} /> : index + 1}
              </span>
              <span className={`text-sm font-medium ${index === step ? 'text-white' : 'text-dark-400'}`}>
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${index < step ? 'bg-brand-500' : 'bg-dark-600'}`} />
            )}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 0 ? (
            <form onSubmit={handleShippingSubmit} className="glass-card p-6" noValidate>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin size={19} className="text-brand-400" />
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name" name="name" value={address.name} error={errors.name} onChange={setField} placeholder="John Doe" />
                  <Field label="Phone number" name="phone" value={address.phone} error={errors.phone} onChange={setField} placeholder="9876543210" maxLength={10} inputMode="numeric" />
                </div>

                <Field label="Street address" name="street" value={address.street} error={errors.street} onChange={setField} placeholder="House no., street, area" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="City" name="city" value={address.city} error={errors.city} onChange={setField} placeholder="Pune" />
                  <Field label="State" name="state" value={address.state} error={errors.state} onChange={setField} placeholder="Maharashtra" />
                  <Field label="PIN code" name="pincode" value={address.pincode} error={errors.pincode} onChange={setField} placeholder="411001" maxLength={6} inputMode="numeric" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
                Continue to payment
                <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <section className="glass-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Truck size={17} className="text-brand-400" />
                    Delivering to
                  </h2>
                  <button onClick={() => setStep(0)} className="text-sm text-brand-400 hover:text-brand-300">
                    Edit
                  </button>
                </div>
                <p className="text-white font-medium">{address.name}</p>
                <p className="text-dark-400 text-sm mt-0.5">
                  {address.street}, {address.city}, {address.state} — {address.pincode}
                </p>
                <p className="text-dark-400 text-sm">{address.phone}</p>
              </section>

              <section className="glass-card p-5">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                  <CreditCard size={17} className="text-brand-400" />
                  Payment method
                </h2>

                <div className="space-y-3">
                  <PaymentOption
                    id="cod"
                    selected={paymentMethod === 'cod'}
                    onSelect={setPaymentMethod}
                    title="Cash on Delivery"
                    description="Pay in cash when your order arrives."
                  />
                  <PaymentOption
                    id="razorpay"
                    selected={paymentMethod === 'razorpay'}
                    onSelect={setPaymentMethod}
                    disabled={!onlineEnabled}
                    title="Pay online (Razorpay)"
                    description={
                      onlineEnabled
                        ? 'UPI, cards, net banking and wallets.'
                        : 'Not configured on this server — add Razorpay keys to enable.'
                    }
                  />
                </div>

                <p className="flex items-center gap-2 text-xs text-dark-400 mt-5">
                  <ShieldCheck size={14} className="text-green-400" />
                  Card details never touch our servers.
                </p>
              </section>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing order…
                  </>
                ) : (
                  `Place order · ${formatPrice(pricing.grandTotal)}`
                )}
              </button>

              <button onClick={() => setStep(0)} className="w-full text-center text-sm text-dark-400 hover:text-white transition-colors">
                Back to shipping
              </button>
            </div>
          )}
        </div>

        <aside>
          <div className="glass-card p-5 lg:sticky lg:top-24">
            <h3 className="font-bold text-white mb-4">Price Details</h3>

            <ul className="space-y-3 mb-4 max-h-56 overflow-y-auto">
              {cart.items.map((item) => (
                <li key={item.product} className="flex gap-3 items-center">
                  <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-dark-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium line-clamp-1">{item.name}</p>
                    <p className="text-dark-500 text-xs">Qty {item.quantity}</p>
                  </div>
                  <span className="text-dark-200 text-xs font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 text-sm border-t border-dark-600 pt-4">
              <div className="flex justify-between">
                <dt className="text-dark-300">Subtotal</dt>
                <dd className="text-white">{formatPrice(pricing.itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-300">Shipping</dt>
                <dd className={pricing.shippingCharge === 0 ? 'text-green-400' : 'text-white'}>
                  {pricing.shippingCharge === 0 ? 'Free' : formatPrice(pricing.shippingCharge)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-300">GST (18%)</dt>
                <dd className="text-white">{formatPrice(pricing.taxAmount)}</dd>
              </div>
              <div className="border-t border-dark-600 pt-2.5 flex justify-between font-bold">
                <dt className="text-white">Total</dt>
                <dd className="text-brand-400 text-base">{formatPrice(pricing.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, name, value, error, onChange, ...inputProps }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-dark-300 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={Boolean(error)}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        {...inputProps}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function PaymentOption({ id, title, description, selected, disabled, onSelect }) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors
        ${disabled
          ? 'border-dark-600 bg-dark-800 opacity-50 cursor-not-allowed'
          : selected
            ? 'border-brand-500/60 bg-brand-500/10'
            : 'border-dark-600 bg-dark-700 hover:border-brand-500/30'}`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={id}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(id)}
        className="mt-1 accent-brand-500"
      />
      <span>
        <span className="block text-white font-medium text-sm">{title}</span>
        <span className="block text-dark-400 text-xs mt-0.5">{description}</span>
      </span>
    </label>
  )
}
