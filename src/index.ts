import chalk from 'chalk';
import * as yaml from 'js-yaml';

export interface LogLevel {
  DEBUG: number;
  INFO: number;
  SUCCESS: number;
  WARN: number;
  ERROR: number;
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  SUCCESS: 2,
  WARN: 3,
  ERROR: 4,
} as const;

export type LogLevelName = keyof LogLevel;

export interface LoggerOptions {
  level?: LogLevelName;
  pretty?: boolean;
  timestamp?: boolean;
  id?: string;
}

export interface LogEntry {
  level: LogLevelName;
  message: string;
  timestamp: string;
  id?: string;
  [key: string]: any;
}

// Constants
const YAML_INDENT = 2;
const OUTPUT_INDENT = '  ';

// Type for error with optional cause
interface ErrorWithCause extends Error {
  cause?: unknown;
}

export class Logger {
  private level: number;
  private pretty: boolean;
  private timestamp: boolean;
  private id?: string;

  constructor(options: LoggerOptions = {}) {
    this.level = LOG_LEVELS[options.level || 'INFO'];
    this.pretty = options.pretty ?? process.env.NODE_ENV !== 'production';
    this.timestamp = options.timestamp ?? true;
    this.id = options.id;
  }

  private log(
    level: LogLevelName,
    messageOrError: string | Error,
    meta: Record<string, any> = {}
  ): void {
    if (LOG_LEVELS[level] < this.level) {
      return;
    }

    const { message, processedMeta } = this.processMessageAndMeta(
      messageOrError,
      meta,
      level
    );
    const entryId = this.determineEntryId(processedMeta, messageOrError);

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(entryId && { id: entryId }),
      ...processedMeta,
    };

    if (this.pretty) {
      this.prettyLog(entry);
    } else {
      this.jsonLog(entry);
    }
  }

  private processMessageAndMeta(
    messageOrError: string | Error,
    meta: Record<string, any>,
    level: LogLevelName
  ): { message: string; processedMeta: Record<string, any> } {
    if (!(messageOrError instanceof Error)) {
      return { message: messageOrError, processedMeta: { ...meta } };
    }

    const message = messageOrError.message;
    const isErrorOnly = level === 'ERROR' && Object.keys(meta).length === 0;

    if (isErrorOnly) {
      const cause = this.processCause(messageOrError as ErrorWithCause);
      const processedMeta: Record<string, any> = {
        stack: messageOrError.stack,
        __isErrorOnly: true,
      };
      if (cause) {
        processedMeta.cause = cause;
      }
      return { message, processedMeta };
    }

    const cause = this.extractCause(messageOrError as ErrorWithCause);
    const errorData: Record<string, any> = {
      name: messageOrError.name,
      message: messageOrError.message,
      stack: messageOrError.stack,
    };
    if (cause) {
      errorData.cause = cause;
    }

    return {
      message,
      processedMeta: {
        error: errorData,
        ...meta,
      },
    };
  }

  private processCause(error: ErrorWithCause): any {
    if (!error.cause) return null;

    return error.cause instanceof Error
      ? {
          name: error.cause.name,
          message: error.cause.message,
          stack: error.cause.stack,
        }
      : error.cause;
  }

  private extractCause(error: ErrorWithCause): unknown {
    return error.cause || null;
  }

  private determineEntryId(
    meta: Record<string, any>,
    messageOrError: string | Error
  ): string | undefined {
    if (this.id) return this.id;

    if (meta.__isErrorOnly && messageOrError instanceof Error) {
      return messageOrError.name;
    }

    return undefined;
  }

  private prettyLog(entry: LogEntry): void {
    const timestamp = this.formatTimestamp(entry.timestamp);
    const level = this.formatLevel(entry.level);
    const idSuffix = this.formatIdSuffix(entry.id);

    let output = `${timestamp}${level}${idSuffix} ${entry.message}`;

    const meta = this.extractMetadata(entry);
    if (Object.keys(meta).length > 0) {
      output += this.formatMetadata(meta, entry);
    }

    console.log(output);
  }

  private formatTimestamp(timestamp: string): string {
    if (!this.timestamp) return '';

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return (
      chalk.gray(
        `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
      ) + ' '
    );
  }

  private formatLevel(level: LogLevelName): string {
    switch (level) {
      case 'DEBUG':
        return chalk.cyan(level);
      case 'INFO':
        return chalk.blue(level);
      case 'SUCCESS':
        return chalk.green(level);
      case 'WARN':
        return chalk.yellow(level);
      case 'ERROR':
        return chalk.red(level);
      default:
        return level;
    }
  }

  private formatIdSuffix(id?: string): string {
    return id ? ' ' + chalk.white.bold(id) + ':' : '';
  }

  private extractMetadata(entry: LogEntry): Record<string, any> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      level: _level,
      message: _message,
      timestamp: _timestamp,
      id: _id,
      __isErrorOnly: _isErrorOnly,
      ...meta
    } = entry;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return meta;
  }

  private formatMetadata(meta: Record<string, any>, entry: LogEntry): string {
    const isErrorOnly = (entry as any).__isErrorOnly;

    if (isErrorOnly) {
      return this.formatErrorOnlyMetadata(meta);
    }

    const yamlOutput = this.dumpYaml(meta);
    const indentedYaml = this.indentLines(yamlOutput);
    return `\n${chalk.dim(indentedYaml)}`;
  }

  private formatErrorOnlyMetadata(meta: Record<string, any>): string {
    let output = '';

    // Format stack as raw string
    if (meta.stack) {
      const indentedStack = this.indentLines(meta.stack);
      output += `\n${chalk.red(indentedStack)}`;
    }

    // Format cause as YAML
    if (meta.cause) {
      const causeYaml = this.dumpYaml({ cause: meta.cause });
      const indentedCause = this.indentLines(causeYaml);
      output += `\n${chalk.red(indentedCause)}`;
    }

    return output;
  }

  private dumpYaml(data: any): string {
    return yaml
      .dump(data, {
        indent: YAML_INDENT,
        noRefs: true,
        lineWidth: -1,
      })
      .trim();
  }

  private indentLines(text: string): string {
    return text
      .split('\n')
      .map((line) => `${OUTPUT_INDENT}${line}`)
      .join('\n');
  }

  private jsonLog(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  debug(message: string | Error, meta?: Record<string, any>): void {
    this.log('DEBUG', message, meta);
  }

  info(message: string | Error, meta?: Record<string, any>): void {
    this.log('INFO', message, meta);
  }

  success(message: string | Error, meta?: Record<string, any>): void {
    this.log('SUCCESS', message, meta);
  }

  warn(message: string | Error, meta?: Record<string, any>): void {
    this.log('WARN', message, meta);
  }

  error(message: string | Error, meta?: Record<string, any>): void {
    this.log('ERROR', message, meta);
  }
}

// Default logger instance
export const logger = new Logger();

// Export convenience functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const success = logger.success.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);

export default Logger;
