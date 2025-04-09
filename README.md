# NestJS Logger Module

A powerful and flexible logging module for NestJS applications, featuring Winston-based logging, HTTP request/response tracking, and trace ID support.

## Features

- 🚀 Winston-based logger service
- 🌐 HTTP request/response logging middleware
- 🔍 Trace ID support via nestjs-cls
- ⚙️ Configurable route exclusions
- 🔧 Both sync and async configuration options
- 📝 Structured logging format
- 🎯 TypeScript support

## Installation

```bash
npm install nestjs-custom-modules
```

## Requirements

- Node.js >= 20
- NestJS >= 11.0.0

## Quick Start

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-custom-modules';

@Module({
  imports: [
    LoggerModule.register({
      httpLogger: {
        enabled: true,
        exclude: ['/health', '/metrics']
      }
    }),
  ],
})
export class AppModule {}
```

### Using Environment Variables

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-custom-modules';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        httpLogger: {
          enabled: configService.get('HTTP_LOGGING_ENABLED') === 'true',
          exclude: configService.get('HTTP_LOGGING_EXCLUDE')?.split(',') || []
        }
      }),
    }),
  ],
})
export class AppModule {}
```

## Usage Examples

### Using the Logger Service

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'nestjs-custom-modules';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  async createUser(userData: any) {
    this.logger.log('UserService', 'createUser', 'start', { userData });
    
    // Your user creation logic here
    
    this.logger.log('UserService', 'createUser', 'end', { userId: 123 });
  }
}
```

### Using the Log Decorators

#### Method-level Logging
The `@Log()` decorator provides automatic method logging for individual methods:

```typescript
import { Injectable } from '@nestjs/common';
import { Log } from 'nestjs-custom-modules';

@Injectable()
export class UserService {
  @Log()
  async createUser(userData: any) {
    return { userId: 123 };
  }
}
```

#### Class-level Logging
The `@LogAll()` decorator automatically logs all methods in a class:

```typescript
import { Injectable } from '@nestjs/common';
import { LogAll } from 'nestjs-custom-modules';

@Injectable()
@LogAll()
export class UserService {
  async createUser(userData: any) {
    return { userId: 123 };
  }

  getUserProfile(userId: string) {
    return { id: userId, name: 'John Doe' };
  }
  
  updateUser(userId: string, data: any) {
    // All methods are automatically logged
    return { success: true };
  }
}
```

Both decorators will automatically:
- Log method entry with arguments
- Log method exit with result and execution duration
- Log any errors that occur during execution
- Mask sensitive data in logs using the built-in masking utility

Example log output:
```json
// Method start
{
  "level": "info",
  "resource": "UserService",
  "functionName": "createUser",
  "action": "start",
  "message": "UserService-createUser-start",
  "payload": {
    "args": [{"name": "John Doe", "email": "john@example.com"}]
  },
  "traceId": "abc-123"
}

// Method end
{
  "level": "info",
  "resource": "UserService",
  "functionName": "createUser",
  "action": "end",
  "message": "UserService-createUser-end",
  "payload": {
    "args": [{"name": "John Doe", "email": "john@example.com"}],
    "result": {"userId": 123},
    "executeDuration": 45
  },
  "traceId": "abc-123"
}
```

## Configuration Options

### LoggerModuleOptions

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| httpLogger | HttpLoggerOptions | No | Configuration for HTTP logging middleware |

### HttpLoggerOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable/disable HTTP logging middleware |
| exclude | string[] | [] | Array of routes to exclude from logging (supports wildcards) |

## HTTP Logging

The HTTP logging middleware automatically captures:

- Request details (method, URL, headers, IP, user agent)
- Response details (status code, response time)
- Trace ID for request tracking
- Request/response body (configurable)

Each HTTP request generates two log entries:
1. When the request is received
2. When the response is sent

## Dependencies

- winston: ^3.17.0
- nestjs-cls: ^5.4.2
- dayjs: ^1.11.13
- uuid: ^11.1.0
- circular-json: ^0.5.9
- ramda: ^0.30.1

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
