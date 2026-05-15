// ─── Affiliate Tags ────────────────────────────────────────────────────────────
// Sign up first, then replace the placeholder tags:
//   Amazon.in  → https://affiliate-program.amazon.in   (tag ends in -21)
//   Amazon.com → https://affiliate-program.amazon.com  (tag ends in -20)
//   Burpee     → search "Burpee Seeds affiliate" on impact.com
//   Flipkart   → https://affiliate.flipkart.com

const AMAZON_IN_TAG = 'farmsync-21';   // ← replace after Amazon.in approval
const AMAZON_US_TAG = 'farmsync-20';   // ← replace after Amazon.com approval

export function amazonInUrl(searchTerm) {
  return `https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}&tag=${AMAZON_IN_TAG}`;
}

export function amazonUsUrl(searchTerm) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${AMAZON_US_TAG}`;
}

// Burpee runs through Impact — swap base URL for your Impact tracking link once approved
export function burpeeUrl(searchTerm) {
  return `https://www.burpee.com/search?q=${encodeURIComponent(searchTerm)}`;
}

// Flipkart Affiliate — swap for your dl.flipkart.com deep-link once approved
export function flipkartUrl(searchTerm) {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(searchTerm)}`;
}
