import { Logger } from '../dist/index.js';

console.log('Service IDs Examples\n');

// Create loggers for different services/components
const apiLogger = new Logger({ id: 'API' });
const dbLogger = new Logger({ id: 'DB' });
const authLogger = new Logger({ id: 'AUTH' });

console.log('=== Application Startup ===');
apiLogger.info('Starting API server');
dbLogger.info('Connecting to database');
authLogger.info('Initializing authentication system');

console.log('\n=== User Request Flow ===');
apiLogger.info('Received login request');
authLogger.info('Validating credentials');
dbLogger.debug('User found in database');
authLogger.info('Authentication successful');
apiLogger.info('Login successful', {
  userId: 'usr_12345',
  email: 'user@example.com',
});

console.log('\nService IDs examples completed!');
