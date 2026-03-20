const { hashPassword, comparePassword } = require('./lib/bcrypt');

async function test() {
  try {
    console.log('Testing lib/bcrypt.ts...');
    const hash = await hashPassword('password123');
    console.log('Hash Success:', hash);
    
    const isValid = await comparePassword('password123', hash);
    console.log('Compare Success:', isValid);
    
    const isInvalid = await comparePassword('wrong', hash);
    console.log('Compare Wrong Success (should be false):', isInvalid);
    
    process.exit(0);
  } catch (err) {
    console.error('Bcrypt Test Failed:', err.message);
    process.exit(1);
  }
}

test();
