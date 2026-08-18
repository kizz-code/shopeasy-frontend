export const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Products keep a list of images; the one flagged primary wins, else the first.
export const primaryImage = (product) =>
  product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url || "";

export const effectivePrice = (product) =>
  product?.discountedPrice > 0 ? product.discountedPrice : product?.price || 0;

export const discountPercent = (product) => {
  if (!product?.discountedPrice || product.discountedPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
};
