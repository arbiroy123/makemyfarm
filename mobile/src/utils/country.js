import * as Localization from 'expo-localization';

const SUPPORTED = ['IN', 'US'];

/**
 * Detect country from device locale. Falls back to 'IN'.
 */
export function detectCountry() {
  const region = Localization.getLocales?.()?.[0]?.regionCode ?? '';
  return SUPPORTED.includes(region) ? region : 'IN';
}

export const COUNTRY_INFO = {
  IN: { flag: '🇮🇳', label: 'India',     price: '₹99',   currency: 'INR' },
  US: { flag: '🇺🇸', label: 'USA',       price: '$4.99', currency: 'USD' },
};
