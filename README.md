# NestJS Logger Module

A powerful and flexible logging module for NestJS applications, featuring Winston-based logging, HTTP request/response tracking, trace ID support, and BullMQ worker logging.

## Features

- 🚀 Winston-based logger service with structured logging
- 🌐 HTTP request/response logging middleware
- 🔍 Trace ID support via nestjs-cls
- ⚙️ Configurable route exclusions
- 🔧 Both sync and async configuration options
- 📝 Method and class-level logging decorators
- 🎯 TypeScript support
- 🔄 BullMQ worker logging support

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
```typescript
import { Injectable } from '@nestjs/common';
import { LogAll } from 'nestjs-custom-modules';

@Injectable()
@LogAll()
export class UserService {
  async createUser(userData: any) {
    return { userId: 123 };
  }

  async getUserProfile(userId: string) {
    return { id: userId, name: 'John Doe' };
  }
}
```

### BullMQ Worker Logging

```typescript
import { Processor } from '@nestjs/bullmq';
import { SuperWorkerHost } from 'nestjs-custom-modules';

@Processor('my-queue')
export class MyQueueProcessor extends SuperWorkerHost {
  async process(job: Job) {
    // Your job processing logic here
    return { processed: true };
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

## Log Output Format

All logs are output in JSON format with the following structure:

```json
{
  "level": "info",
  "resource": "ServiceName",
  "functionName": "methodName",
  "action": "start|end|error",
  "message": "ServiceName-methodName-action",
  "payload": {
    // Additional context data
  },
  "traceId": "unique-trace-id"
}
```

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
