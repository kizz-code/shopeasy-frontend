import { Clock, CheckCircle2, Truck, Home, XCircle } from 'lucide-react'

// One definition of the order lifecycle, used by the badge, the customer timeline
// and the admin status dropdown. It matches the enum on the Order model.
export const ORDER_STATUSES = {
  pending: {
    label: 'Pending',
    icon: Clock,
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  delivered: {
    label: 'Delivered',
    icon: Home,
    badge: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    badge: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
}

// The happy path a customer sees as a progress line. Cancelled is deliberately not
// part of it - it is an exit, not a step.
export const TIMELINE = ['pending', 'confirmed', 'shipped', 'delivered']

// Mirrors NEXT_STATUS in the backend order controller, so the admin dropdown only
// offers moves the API will actually accept.
export const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const statusConfig = (status) => ORDER_STATUSES[status] || ORDER_STATUSES.pending
