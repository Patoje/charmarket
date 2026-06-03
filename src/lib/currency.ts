/**
 * Calculates the price in ARS (Argentine Pesos) based on the USD price and the global exchange rate.
 */
export function calculateArsPrice(usdPrice: number, exchangeRate: number): number {
  return usdPrice * exchangeRate;
}

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
