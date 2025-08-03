import { logger, debug, info, success, warn, error } from '../dist/index.js';

console.log('Basic Logger Usage Examples\n');

// Using the default logger instance
console.log('=== Default Logger ===');
logger.info('Application started');
logger.success('Database connection established');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Using convenience functions
console.log('\n=== Convenience Functions ===');
info('Using info() function');
success('Using success() function');
warn('Using warn() function');
error('Using error() function');

// Debug messages (won't show by default since level is INFO)
console.log('\n=== Debug Messages (hidden by default) ===');
debug('This debug message is hidden');
logger.debug('This debug message is also hidden');

console.log('\nBasic usage examples completed!');
