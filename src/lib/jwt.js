import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('⚠️ JWT_SECRET is not defined! Set it in your .env.local or Vercel environment variables.');
}

export function signToken(payload, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  const defaultOptions = {
    expiresIn: '7d', // Default expiration
  };

  return jwt.sign(payload, JWT_SECRET, { ...defaultOptions, ...options });
}

export function verifyToken(token) {
  try {
    if (!JWT_SECRET) {
      console.error('Token verification failed: JWT_SECRET is not configured');
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}
