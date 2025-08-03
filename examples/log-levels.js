import { Logger } from '../dist/index.js';

console.log('Log Levels Examples\n');

// Create loggers with different levels
const debugLogger = new Logger({ level: 'DEBUG', id: 'DEBUG' });
const infoLogger = new Logger({ level: 'INFO', id: 'INFO' });
const successLogger = new Logger({ level: 'SUCCESS', id: 'SUCCESS' });
const warnLogger = new Logger({ level: 'WARN', id: 'WARN' });
const errorLogger = new Logger({ level: 'ERROR', id: 'ERROR' });

console.log('=== DEBUG Level Logger (shows all messages) ===');
debugLogger.debug('Debug message - visible');
debugLogger.info('Info message - visible');
debugLogger.success('Success message - visible');
debugLogger.warn('Warn message - visible');
debugLogger.error('Error message - visible');

console.log('\n=== INFO Level Logger (hides debug) ===');
infoLogger.debug('Debug message - hidden');
infoLogger.info('Info message - visible');
infoLogger.success('Success message - visible');
infoLogger.warn('Warn message - visible');
infoLogger.error('Error message - visible');

console.log('\n=== SUCCESS Level Logger (hides debug and info) ===');
successLogger.debug('Debug message - hidden');
successLogger.info('Info message - hidden');
successLogger.success('Success message - visible');
successLogger.warn('Warn message - visible');
successLogger.error('Error message - visible');

console.log('\n=== WARN Level Logger (shows warn and error only) ===');
warnLogger.debug('Debug message - hidden');
warnLogger.info('Info message - hidden');
warnLogger.success('Success message - hidden');
warnLogger.warn('Warn message - visible');
warnLogger.error('Error message - visible');

console.log('\n=== ERROR Level Logger (shows error only) ===');
errorLogger.debug('Debug message - hidden');
errorLogger.info('Info message - hidden');
errorLogger.success('Success message - hidden');
errorLogger.warn('Warn message - hidden');
errorLogger.error('Error message - visible');

console.log('\nLog levels examples completed!');
