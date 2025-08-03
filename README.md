# @skierkowski/logger

A simple logging library with pretty formatting in development and JSONL in production.

## Features

- **Environment-aware formatting**: Pretty colors in development, structured JSON in production
- **Configurable log levels**: DEBUG, INFO, WARN, ERROR
- **TypeScript support**: Full type definitions included
- **Beautiful colors**: Uses chalk for reliable cross-platform color support
- **YAML formatting**: Pretty metadata display with YAML instead of JSON
- **Flexible**: Use as class instance or convenience functions

## Installation

```bash
yarn add @skierkowski/logger
```

## Usage

### Basic Usage

```typescript
import { logger } from "@skierkowski/logger";

logger.info("Application started");
logger.warn("This is a warning");
logger.error("Something went wrong");
```

> **Note**: Works with both ES6 modules (`import`) and CommonJS (`require`).

### Using Convenience Functions

```typescript
import { info, warn, error } from "@skierkowski/logger";

info("Application started");
warn("This is a warning");
error("Something went wrong");
```

### Creating Custom Logger

```typescript
import Logger from "@skierkowski/logger";

const customLogger = new Logger({
  level: "DEBUG",
  pretty: true,
  timestamp: true,
  id: "API",
});

customLogger.debug("Debug message");
```

### Using Service IDs

```typescript
import Logger from "@skierkowski/logger";

// Create loggers for different services
const dbLogger = new Logger({ id: "DB" });
const apiLogger = new Logger({ id: "API" });
const authLogger = new Logger({ id: "AUTH" });

dbLogger.info("Database connection established");
apiLogger.warn("Rate limit exceeded");
authLogger.error("Authentication failed");
```

### Adding Metadata

```typescript
import { logger } from "@skierkowski/logger";

logger.info("User logged in", {
  userId: "12345",
  email: "user@example.com",
  timestamp: Date.now(),
  preferences: {
    theme: "dark",
    notifications: true,
  },
});
```

### Error Object Support

```typescript
import { logger } from "@skierkowski/logger";

try {
  // Some risky operation
  JSON.parse("invalid json");
} catch (err) {
  // Log error directly - includes stack trace and error details
  logger.error(err);
  
  // Add additional context
  logger.error(err, {
    operation: "JSON parsing",
    userId: "12345",
    retryAttempt: 3,
  });
}
```

### Automatic Error Type Prefixes

When logging error objects without a configured prefix, the error type automatically becomes the prefix:

```typescript
const logger = new Logger(); // No prefix configured

logger.error(new Error('Something failed'));        // → "Error: Something failed"
logger.error(new TypeError('Type mismatch'));       // → "TypeError: Type mismatch"
logger.error(new SyntaxError('Invalid syntax'));    // → "SyntaxError: Invalid syntax"

// With configured prefix, it takes precedence
const appLogger = new Logger({ id: 'APP' });
appLogger.error(new Error('Failed'));               // → "APP: Failed"
```

## Configuration Options

- `level`: Log level ('DEBUG' | 'INFO' | 'WARN' | 'ERROR')
- `pretty`: Enable pretty formatting (default: `true` in development, `false` in production)
- `timestamp`: Include timestamps (default: `true`)
- `id`: Service/component identifier (optional, appears white & bold in pretty mode)

## Output Formats

### Development (Pretty)

```
2025-08-03 12:00:00.123 INFO  API: User logged in
  userId: '12345'
  email: user@example.com
  preferences:
    theme: dark
    notifications: true

2025-08-03 12:00:01.456 WARN  API: Rate limit warning
2025-08-03 12:00:02.789 ERROR DB: Connection failed
```

### Production (JSONL)

```json
{"level":"INFO","message":"Application started","timestamp":"2023-08-03T12:00:00.000Z","id":"API"}
{"level":"WARN","message":"This is a warning","timestamp":"2023-08-03T12:00:01.000Z","id":"API"}
{"level":"ERROR","message":"Something went wrong","timestamp":"2023-08-03T12:00:02.000Z","id":"DB"}
```

## Examples

The repository includes comprehensive examples showing various usage patterns:

```bash
# Run all examples
yarn examples

# Or run individual examples
yarn examples:basic      # Basic usage patterns
yarn examples:levels     # Log level filtering
yarn examples:services   # Service ID usage
yarn examples:metadata   # Metadata formatting
yarn examples:production # Development vs production modes
yarn examples:errors     # Error object handling
```

See the [`examples/`](./examples/) directory for detailed examples and documentation.

> **Note**: Examples use ES6 import syntax with `.js` files (enabled by a local `package.json` in the examples directory) while maintaining full CommonJS compatibility for the main library.

## Development

```bash
# Install dependencies
yarn install

# Build the library
yarn build

# Clean build artifacts
yarn clean
```
