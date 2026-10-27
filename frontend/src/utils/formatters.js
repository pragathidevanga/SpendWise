/**
 * Formatting utilities for currency, dates, percentages, and numbers.
 */

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { symbol: '$', code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  CAD: { symbol: 'CA$', code: 'CAD', label: 'Canadian Dollar (CA$)', locale: 'en-CA' },
  AUD: { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$)', locale: 'en-AU' },
  JPY: { symbol: '¥', code: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP' }
};

export function formatCurrency(amount, currencyCode = 'INR') {
  const num = Number(amount) || 0;
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    return `${config.symbol}${num.toLocaleString()}`;
  }
}

export function formatDate(dateString, format = 'medium') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (format === 'short') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (format === 'input') {
    return date.toISOString().split('T')[0];
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatPercent(value, decimals = 1) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}%`;
}
