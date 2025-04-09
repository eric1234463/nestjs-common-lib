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

## Requirements

- Node.js >= 18
- NestJS >= 11.0.0

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
