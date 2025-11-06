/**
 * Pricing utilities for the bookstore
 * 
 * All prices are stored in the database as base prices.
 * A 3% payment processing fee is applied to the base price
 * before displaying to users or adding to cart.
 */

const PROCESSING_FEE_RATE = 0.03 // 3%

/**
 * Apply 3% payment processing fee to a base price
 * @param basePrice - The original price from the database
 * @returns The price with processing fee included
 */
export function applyProcessingFee(basePrice: number): number {
  return basePrice * (1 + PROCESSING_FEE_RATE)
}

/**
 * Apply processing fee to multiple prices
 * @param basePrices - Array of base prices
 * @returns Array of prices with processing fee included
 */
export function applyProcessingFeeToArray(basePrices: number[]): number[] {
  return basePrices.map(price => applyProcessingFee(price))
}

/**
 * Get the processing fee amount for a given base price
 * @param basePrice - The original price from the database
 * @returns The processing fee amount
 */
export function getProcessingFeeAmount(basePrice: number): number {
  return basePrice * PROCESSING_FEE_RATE
}
