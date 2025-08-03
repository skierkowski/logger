import { Logger } from '../dist/index.js';

console.log('Metadata Examples\n');

const logger = new Logger({ id: 'DEMO', level: 'DEBUG' });

console.log('=== Simple Metadata ===');
logger.info('User registration', {
  userId: 'usr_67890',
  email: 'newuser@example.com',
  plan: 'premium',
  verified: true,
});

console.log('\n=== Complex Nested Object ===');
logger.warn('API rate limit exceeded', {
  endpoint: '/api/v1/users',
  client: {
    name: 'Mobile App',
    version: '2.1.0',
  },
  rateLimitInfo: {
    limit: 1000,
    remaining: 0,
    resetTime: '2025-08-03T17:30:00Z',
  },
});

console.log('\n=== Array Data ===');
logger.error('Validation errors', {
  errors: [
    { field: 'email', message: 'Invalid format' },
    { field: 'password', message: 'Too short' },
  ],
});

console.log('\nMetadata examples completed!');
