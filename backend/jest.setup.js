// Jest setup file
const { config } = require('dotenv');
const { join } = require('path');

// Load test environment variables
config({ path: join(__dirname, '.env.test') });