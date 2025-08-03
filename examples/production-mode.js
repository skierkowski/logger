import { Logger } from '../dist/index.js';

console.log('Production vs Development Mode Examples\n');

// Development mode logger (pretty formatting)
const devLogger = new Logger({
  id: 'DEV',
  pretty: true,
  timestamp: true,
  level: 'DEBUG',
});

// Production mode logger (JSON formatting)
const prodLogger = new Logger({
  id: 'PROD',
  pretty: false,
  timestamp: true,
  level: 'INFO',
});

console.log('=== Development Mode (Pretty with Colors) ===');
devLogger.info('Application event', {
  event: 'user_action',
  details: {
    action: 'file_upload',
    user: {
      id: 'usr_123',
      email: 'user@company.com',
    },
  },
});

console.log('\n=== Production Mode (JSON Lines for Log Aggregators) ===');
prodLogger.info('Service started', {
  version: '1.2.3',
  environment: 'production',
  port: 8080,
});
prodLogger.error('System error', {
  errorCode: 'SYS_001',
  message: 'Database connection failed',
});

console.log('\n=== Environment-based Auto Detection ===');
console.log('Tip: Set NODE_ENV=production for automatic JSON mode');
console.log('Or NODE_ENV=development for automatic pretty mode');

// Show what automatic detection looks like
const autoLogger = new Logger({ id: 'AUTO' });
autoLogger.info('This logger auto-detects based on NODE_ENV', {
  currentEnv: process.env.NODE_ENV || 'undefined',
  prettyMode: process.env.NODE_ENV !== 'production',
});

console.log('\nProduction mode examples completed!');
