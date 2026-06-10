import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api';
import {
  MapPin,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Package,
  CheckCircle2,
} from 'lucide-react';

const STEPS = ['Shipping', 'Review', 'Payment'];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const cartTotal = cart?.totalPrice || 0;
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState({});

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + shipping + tax;

  const validate = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!address.street.trim()) e.street = 'Street address is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state.trim()) e.state = 'State is required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (validate()) setStep(1);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create Razorpay order
      const { data } = await api.post('/payment/create-order', {
        amount: grandTotal,
        shippingAddress: address,
        cartItems: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      const { razorpayOrderId, amount, keyId, orderId } = data;

      // Step 2: Open Razorpay checkout
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'ShopEasy',
        description: `Order #${orderId}`,
        image: '/logo.png',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 3: Verify payment
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            clearCart();
            toast.success('Payment successful! Order placed.');
            navigate(`/orders/${orderId}`, { state: { success: true } });
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        notes: {
          address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
        },
        theme: { color: '#f17023' },
        modal: {
          ondismiss: async () => {
            try {
              await api.post('/payment/failure', { orderId, razorpayOrderId });
            } catch {}
            toast.error('Payment cancelled.');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        try {
          await api.post('/payment/failure', {
            orderId,
            razorpayOrderId,
            error: response.error,
          });
        } catch {}
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment. Try again.');
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `input-field w-full ${errors[name] ? 'border-red-500 focus:ring-red-500/30' : ''}`;

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Check<span className="gradient-text">out</span>
        </h1>
        <p className="text-dark-400 mb-8">Complete your purchase securely</p>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < step
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : i === step
                      ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                      : 'border-dark-600 text-dark-500 bg-dark-800'
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    i === step ? 'text-white' : i < step ? 'text-brand-400' : 'text-dark-500'
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-brand-500' : 'bg-dark-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 0: Shipping Address */}
            {step === 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-400" />
                  Shipping Address
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className={fieldClass('fullName')}
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className={fieldClass('phone')}
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      className={fieldClass('street')}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="House no., Street, Area, Locality"
                    />
                    {errors.street && (
                      <p className="text-red-400 text-xs mt-1">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        className={fieldClass('city')}
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        className={fieldClass('state')}
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        className={fieldClass('pincode')}
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="400001"
                        maxLength={6}
                      />
                      {errors.pincode && (
                        <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      className="input-field w-full bg-dark-700 cursor-not-allowed"
                      value={address.country}
                      readOnly
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                  >
                    Continue to Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Delivery Address */}
                <div className="glass-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      Delivering to
                    </h2>
                    <button
                      onClick={() => setStep(0)}
                      className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-white font-medium">{address.fullName}</p>
                  <p className="text-dark-400 text-sm mt-0.5">
                    {address.street}, {address.city}, {address.state} — {address.pincode}
                  </p>
                  <p className="text-dark-400 text-sm">{address.phone}</p>
                </div>

                {/* Items */}
                <div className="glass-card p-5">
                  <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-brand-400" />
                    Order Items ({cart.length})
                  </h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex gap-3 items-center">
                        <img
                          src={item.product.images?.[0] || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-dark-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-dark-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-brand-400 font-semibold text-sm">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-400" />
                  Secure Payment
                </h2>

                <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://razorpay.com/favicon.png"
                      alt="Razorpay"
                      className="w-6 h-6"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                    <span className="text-white font-medium">Razorpay — Secure Checkout</span>
                  </div>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    You'll be redirected to Razorpay's secure payment page. We accept UPI,
                    credit/debit cards, net banking, and wallets.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['UPI', 'Visa', 'Mastercard', 'Net Banking', 'Wallets'].map((m) => (
                      <span key={m} className="badge text-xs">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-dark-400 mb-6">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  256-bit SSL encryption. Your payment info is never stored.
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initiating Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{grandTotal.toLocaleString()}
                      <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-dark-400 hover:text-white transition-colors mt-3"
                >
                  ← Back to Review
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="glass-card p-5 sticky top-24">
              <h3 className="font-bold text-white mb-4">Price Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-dark-700 pt-2.5 flex justify-between font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-brand-400 text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {cartTotal > 999 && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-400 text-center">
                  🎉 You save ₹99 on shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
