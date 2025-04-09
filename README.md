# NestJS Logger Module

A custom NestJS module for easy logging setup with HTTP request/response logging middleware.

## Features

- Winston-based logger service
- HTTP request/response logging middleware
- Support for trace IDs via nestjs-cls
- Configurable route exclusions for HTTP logging
- Both synchronous and asynchronous module configuration

## Installation

```bash
npm install nestjs-custom-modules
```

## Usage

### Basic Usage

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

### Async Configuration

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

### Using the Logger Service

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'nestjs-custom-modules';

@Injectable()
export class YourService {
  constructor(private readonly logger: LoggerService) {}

  doSomething() {
    this.logger.log('YourService', 'doSomething', 'start', { someData: 'value' });
    
    // Your business logic here
    
    this.logger.log('YourService', 'doSomething', 'end', { result: 'success' });
  }
}
```

## HTTP Logging

The HTTP logging middleware automatically logs:

- Request details (method, URL, IP, user agent)
- Response details (status code, response time)

Each HTTP request generates two log entries:
1. When the request starts
2. When the response is sent

## Configuration Options

### LoggerModuleOptions

| Option | Type | Description |
|--------|------|-------------|
| httpLogger | HttpLoggerOptions | Configuration for HTTP logging middleware |

### HttpLoggerOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable HTTP logging middleware |
| exclude | string[] | [] | Routes to exclude from HTTP logging (supports wildcards) |

## License

ISC
