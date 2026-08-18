// These numbers mirror backend/utils/pricing.js. The backend is the source of truth
// for what a customer is actually charged - this copy only exists so the cart and
// checkout pages can show a breakdown before the order is created. If you change
// one, change the other.

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_CHARGE = 49;
export const TAX_RATE = 0.18;

export function calculatePricing(itemsTotal) {
  const shippingCharge = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const taxAmount = Math.round(itemsTotal * TAX_RATE);

  return {
    itemsTotal,
    shippingCharge,
    taxAmount,
    grandTotal: itemsTotal + shippingCharge + taxAmount,
  };
}
