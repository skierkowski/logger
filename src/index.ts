import chalk from 'chalk';
import * as yaml from 'js-yaml';

export interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
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

    let message: string;
    let finalMeta = { ...meta };

    if (messageOrError instanceof Error) {
      message = messageOrError.message;

      // Special case: logger.error(err) with no additional metadata
      if (level === 'ERROR' && Object.keys(meta).length === 0) {
        finalMeta = {
          stack: messageOrError.stack,
          ...((messageOrError as any).cause && {
            cause:
              (messageOrError as any).cause instanceof Error
                ? {
                    name: (messageOrError as any).cause.name,
                    message: (messageOrError as any).cause.message,
                    stack: (messageOrError as any).cause.stack,
                  }
                : (messageOrError as any).cause,
          }),
          __isErrorOnly: true, // Internal flag for prettyLog
        };
      } else {
        // Normal case: nest under 'error' field
        finalMeta = {
          error: {
            name: messageOrError.name,
            message: messageOrError.message,
            stack: messageOrError.stack,
            ...((messageOrError as any).cause && {
              cause: (messageOrError as any).cause,
            }),
          },
          ...meta,
        };
      }
    } else {
      message = messageOrError;
    }

    // Use error type as prefix if no id is set and it's an error-only case
    let entryId = this.id;
    if (
      !entryId &&
      finalMeta.__isErrorOnly &&
      messageOrError instanceof Error
    ) {
      entryId = messageOrError.name;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(entryId && { id: entryId }),
      ...finalMeta,
    };

    if (this.pretty) {
      this.prettyLog(entry);
    } else {
      this.jsonLog(entry);
    }
  }

  private prettyLog(entry: LogEntry): void {
    // Format timestamp as YYYY-MM-DD HH:MM:SS.sss
    let formattedTimestamp = '';
    if (this.timestamp) {
      const date = new Date(entry.timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
      formattedTimestamp =
        chalk.gray(
          `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
        ) + ' ';
    }

    // Format level without brackets, padded for alignment
    const level = entry.level.padEnd(5);
    let coloredLevel: string;
    switch (entry.level) {
      case 'DEBUG':
        coloredLevel = chalk.cyan(level);
        break;
      case 'INFO':
        coloredLevel = chalk.green(level);
        break;
      case 'WARN':
        coloredLevel = chalk.yellow(level);
        break;
      case 'ERROR':
        coloredLevel = chalk.red(level);
        break;
      default:
        coloredLevel = level;
    }

    // Format ID prefix without brackets, after level, with colon
    const idSuffix = entry.id ? ' ' + chalk.white.bold(entry.id) + ':' : '';

    let output = `${formattedTimestamp}${coloredLevel}${idSuffix} ${entry.message}`;

    // Add meta data if present
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
    if (Object.keys(meta).length > 0) {
      const yamlOutput = yaml
        .dump(meta, {
          indent: 2,
          noRefs: true,
          lineWidth: -1,
        })
        .trim();
      // Indent each line of YAML by 2 spaces
      const indentedYaml = yamlOutput
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');

      // Color error fields red when it's an error-only case
      if ((entry as any).__isErrorOnly) {
        // For error-only case, display stack as raw string (not YAML)
        if (meta.stack) {
          const indentedStack = meta.stack
            .split('\n')
            .map((line: string) => `  ${line}`)
            .join('\n');
          output += `\n${chalk.red(indentedStack)}`;
        }

        // Handle cause if present
        if (meta.cause) {
          const causeYaml = yaml
            .dump(
              { cause: meta.cause },
              {
                indent: 2,
                noRefs: true,
                lineWidth: -1,
              }
            )
            .trim();
          const indentedCause = causeYaml
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n');
          output += `\n${chalk.red(indentedCause)}`;
        }
      } else {
        output += `\n${chalk.dim(indentedYaml)}`;
      }
    }

    console.log(output);
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
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);

export default Logger;
