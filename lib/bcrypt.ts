import "server-only";

/**
 * Bcrypt Utility (Server-Side Only)
 * Prevents client-side bundling of bcryptjs and its 'crypto' dependency.
 */
const bcrypt = require("bcryptjs");

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};
