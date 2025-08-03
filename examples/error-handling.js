import { Logger } from '../dist/index.js';

console.log('Error Object Handling Examples\n');

const logger = new Logger({ id: 'ERROR-DEMO', level: 'DEBUG' });

console.log('=== Basic Error Logging ===');

// Log error objects directly
logger.error(new Error('Something went wrong'));

// String vs Error object
logger.error('Simple string message');

console.log('\n=== Error with Context ===');

// Error with additional metadata
try {
  JSON.parse('invalid json');
} catch (err) {
  logger.error(err, {
    operation: 'JSON parsing',
    userId: 'usr_12345',
    retryAttempt: 1,
  });
}

console.log('\n=== Automatic Error Type Prefixes ===');

// Logger without prefix - uses error type automatically
const defaultLogger = new Logger();

defaultLogger.error(new Error('Connection failed'));
defaultLogger.error(new TypeError('Invalid type detected'));
defaultLogger.error(new SyntaxError('Parse error'));

console.log('\nError handling examples completed!');
