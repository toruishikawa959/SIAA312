export const formatPeso = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPesoShort = (amount: number): string => {
  if (amount >= 1000000) {
    return "₱" + (amount / 1000000).toFixed(1) + "M"
  }
  if (amount >= 1000) {
    return "₱" + (amount / 1000).toFixed(1) + "K"
  }
  return "₱" + amount.toFixed(0)
}
