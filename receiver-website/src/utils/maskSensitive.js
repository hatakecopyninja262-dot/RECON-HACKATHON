/**
 * RECON — Sensitive Data Masking Utility
 * Presentational only. Never sends masked values to the backend.
 */

/**
 * Masks a value based on its type.
 * @param {string} value  - The original sensitive value
 * @param {'transaction'|'account'|'phone'|'email'|'generic'} type
 * @returns {string} Masked representation
 */
export function maskSensitive(value, type = 'generic') {
  if (!value) return '';

  switch (type) {
    case 'transaction': {
      // TXN-XXXXXXXX  →  TXN-****-XX99 (last 4 visible)
      const parts = value.split('-');
      if (parts.length >= 2) {
        const last4 = parts[parts.length - 1].slice(-4);
        return `${parts[0]}-****-${last4}`;
      }
      return genericMask(value);
    }

    case 'account': {
      // ACC_USER_001  →  ACC_****_001
      // ACC_MERCHANT_001  →  ACC_********_001
      const accParts = value.split('_');
      if (accParts.length >= 3) {
        const prefix = accParts[0];
        const suffix = accParts[accParts.length - 1];
        const middle = accParts.slice(1, -1).join('_');
        const stars = '*'.repeat(Math.max(4, middle.length));
        return `${prefix}_${stars}_${suffix}`;
      }
      return genericMask(value);
    }

    case 'phone': {
      return value.slice(0, 4) + 'X'.repeat(Math.max(0, value.length - 8)) + value.slice(-4);
    }

    case 'email': {
      const [local, domain] = value.split('@');
      if (!domain) return genericMask(value);
      const [dname, ...drest] = domain.split('.');
      const maskedLocal = local.slice(0, 2) + '*'.repeat(Math.max(2, local.length - 2));
      const maskedDomain = dname[0] + '*'.repeat(Math.max(4, dname.length - 1)) + '.' + drest.join('.');
      return `${maskedLocal}@${maskedDomain}`;
    }

    default:
      return genericMask(value);
  }
}

function genericMask(value) {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
}
