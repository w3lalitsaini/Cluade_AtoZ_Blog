/**
 * Fix existing users with double-hashed passwords.
 *
 * Run ONCE with: node --env-file=.env scripts/fix-passwords.mjs <email> <newPassword>
 *
 * Example:
 *   node --env-file=.env scripts/fix-passwords.mjs admin@example.com MyNewPass123
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment");
  process.exit(1);
}

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error(
    "❌ Usage: node scripts/fix-passwords.mjs <email> <newPassword>",
  );
  process.exit(1);
}

console.log(`🔧 Fixing password for: ${email}`);

await mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String,
  isVerified: Boolean,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const user = await User.findOne({ email });
if (!user) {
  console.error(`❌ No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

// Hash once correctly
const hashed = await bcrypt.hash(newPassword, 12);
await User.updateOne(
  { email },
  { $set: { password: hashed, isVerified: true } },
);

console.log(`✅ Password updated for ${email} (role: ${user.role})`);
console.log(`✅ Account also marked as verified`);
await mongoose.disconnect();
