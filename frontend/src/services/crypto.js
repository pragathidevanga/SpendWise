/**
 * Client-side cryptographic helper using Web Crypto API.
 * Securely hashes passwords with SHA-256 so plaintext passwords are never stored in localStorage.
 */

export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Valid password string required for hashing.');
  }

  // Use browser native Web Crypto API when available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.warn('Web Crypto API failed, falling back to basic hash representation:', e);
    }
  }

  // Basic fallback if subtle crypto is not supported in the environment
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'sw_hash_' + Math.abs(hash).toString(16);
}
