import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function comparePassword(password, hash) {
  if (typeof hash !== 'string') return false;
  const modern = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(hash);
  if (modern) return timingSafeEqual(scryptSync(password, modern[1], 64), Buffer.from(modern[2], 'hex'));
  if (!/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(createHash('sha256').update(password).digest(), Buffer.from(hash, 'hex'));
}
