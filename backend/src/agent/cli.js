require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../../config/db');
const mongoose = require('mongoose');
const { runOnce } = require('./runner');

async function main() {
  try {
    await connectDB();
    const result = await runOnce({ trigger: 'cli' });
    console.log('Agent run completed:', JSON.stringify(result, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Agent run failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
