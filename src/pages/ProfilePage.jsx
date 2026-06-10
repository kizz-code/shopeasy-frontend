import { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'
import {
  User,
  Lock,
  MapPin,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Edit2,
} from 'lucide-react';

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User   },
  { id: 'password',  label: 'Password',  icon: Lock   },
  { id: 'addresses', label: 'Addresses', icon: MapPin  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  /* ── Profile ── */
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  /* ── Password ── */
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPass: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  /* ── Addresses ── */
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null); // null | 'new' | index
  const [addrForm, setAddrForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  /* ── Handlers ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      setUser(data.user || data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const openNewAddress = () => {
    setAddrForm({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
    setEditingAddr('new');
  };

  const openEditAddress = (idx) => {
    setAddrForm({ ...addresses[idx] });
    setEditingAddr(idx);
  };

  const handleAddrSave = async () => {
    if (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      toast.error('Please fill all required address fields.');
      return;
    }
    setAddrLoading(true);
    try {
      let updatedAddresses;
      if (editingAddr === 'new') {
        updatedAddresses = [...addresses, addrForm];
      } else {
        updatedAddresses = addresses.map((a, i) => (i === editingAddr ? addrForm : a));
      }
      const { data } = await api.put('/users/addresses', { addresses: updatedAddresses });
      setAddresses(data.addresses || updatedAddresses);
      setUser((u) => ({ ...u, addresses: data.addresses || updatedAddresses }));
      toast.success(editingAddr === 'new' ? 'Address added!' : 'Address updated!');
      setEditingAddr(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleAddrDelete = async (idx) => {
    if (!window.confirm('Delete this address?')) return;
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      const { data } = await api.put('/users/addresses', { addresses: updated });
      setAddresses(data.addresses || updated);
      setUser((u) => ({ ...u, addresses: data.addresses || updated }));
      toast.success('Address deleted.');
    } catch {
      toast.error('Failed to delete address.');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Avatar Header */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center text-dark-300 hover:text-white transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name || 'User'}</h1>
            <p className="text-dark-400 text-sm">{user?.email}</p>
            <span className="badge mt-1 capitalize">{user?.role || 'customer'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-dark-800 border border-dark-700 rounded-xl mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Personal Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="input-field w-full"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  className="input-field w-full"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* ── Password Tab ── */}
        {activeTab === 'password' && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: '••••••••' },
                { key: 'newPass', label: 'New Password',     placeholder: 'Min. 6 characters' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPwd[key] ? 'text' : 'password'}
                      className="input-field w-full pr-10"
                      value={passwords[key]}
                      onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd({ ...showPwd, [key]: !showPwd[key] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                    >
                      {showPwd[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Password strength hint */}
              {passwords.newPass && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => {
                    const strength =
                      (passwords.newPass.length >= 6 ? 1 : 0) +
                      (/[A-Z]/.test(passwords.newPass) ? 1 : 0) +
                      (/[0-9]/.test(passwords.newPass) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(passwords.newPass) ? 1 : 0);
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          i <= strength
                            ? strength <= 1 ? 'bg-red-400'
                            : strength <= 2 ? 'bg-yellow-400'
                            : strength <= 3 ? 'bg-blue-400'
                            : 'bg-green-400'
                            : 'bg-dark-700'
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {pwdLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {addresses.length === 0 && editingAddr === null && (
              <div className="glass-card p-10 text-center">
                <MapPin className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 mb-4">No saved addresses yet.</p>
              </div>
            )}

            {addresses.map((addr, idx) => (
              editingAddr === idx ? null : (
                <div key={idx} className="glass-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{addr.fullName}</p>
                        {addr.isDefault && <span className="badge text-xs">Default</span>}
                      </div>
                      <p className="text-dark-400 text-sm">{addr.street}</p>
                      <p className="text-dark-400 text-sm">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      {addr.phone && <p className="text-dark-500 text-xs mt-0.5">📞 {addr.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditAddress(idx)}
                        className="p-1.5 text-dark-400 hover:text-brand-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddrDelete(idx)}
                        className="p-1.5 text-dark-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}

            {/* Inline Address Form */}
            {(editingAddr === 'new' || typeof editingAddr === 'number') && (
              <div className="glass-card p-5 border border-brand-500/30">
                <h3 className="font-bold text-white mb-4">
                  {editingAddr === 'new' ? 'Add New Address' : 'Edit Address'}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">Full Name</label>
                      <input type="text" className="input-field w-full text-sm" value={addrForm.fullName}
                        onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">Phone</label>
                      <input type="tel" className="input-field w-full text-sm" value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} placeholder="9876543210" maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Street Address *</label>
                    <input type="text" className="input-field w-full text-sm" value={addrForm.street}
                      onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} placeholder="House no., Street, Area" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">City *</label>
                      <input type="text" className="input-field w-full text-sm" value={addrForm.city}
                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">State *</label>
                      <input type="text" className="input-field w-full text-sm" value={addrForm.state}
                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} placeholder="Maharashtra" />
                    </div>
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">PIN Code *</label>
                      <input type="text" className="input-field w-full text-sm" value={addrForm.pincode}
                        onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} placeholder="400001" maxLength={6} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm text-dark-300">Set as default address</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleAddrSave} disabled={addrLoading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {addrLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Address
                    </button>
                    <button onClick={() => setEditingAddr(null)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {editingAddr === null && (
              <button onClick={openNewAddress} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
