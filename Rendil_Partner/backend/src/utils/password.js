import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = (plain) => bcrypt.hashSync(plain, 10);
export const checkPassword = (plain, hash) => !!plain && !!hash && bcrypt.compareSync(plain, hash);
export const strongEnough = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p);
// Readable temporary password for partners created by an admin.
export const tempPassword = () => `Rp-${crypto.randomBytes(4).toString('hex')}${Math.floor(10 + Math.random() * 89)}`;
