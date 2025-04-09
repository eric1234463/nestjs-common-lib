import {
  DynamicModule,
  Module,
  Provider,
  Global,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Inject,
  Optional,
} from '@nestjs/common';
import { CustomLoggerService } from './services/logger.service';
import { LOGGER_MODULE_OPTIONS } from './constants/module-options.constant';
import { HttpLoggerMiddleware } from './middlewares/http-logger.middleware';
import {
  LoggerModuleOptions,
  LoggerModuleAsyncOptions,
} from './interfaces/logger-module-options.interface';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({ providers: [CustomLoggerService], exports: [CustomLoggerService] })
export class LoggerModule implements NestModule {
  constructor(
    @Optional()
    @Inject(LOGGER_MODULE_OPTIONS)
    private readonly options: LoggerModuleOptions = {},
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // Only apply the middleware if HTTP logging is enabled
    if (this.options.httpLogger?.enabled) {
      const excludeRoutes = this.options.httpLogger?.exclude || [];

      // Apply the middleware to all routes except excluded ones
      let middlewareConsumer = consumer.apply(HttpLoggerMiddleware);

      // Apply route exclusions if any are defined
      if (excludeRoutes.length > 0) {
        middlewareConsumer = middlewareConsumer.exclude(
          ...excludeRoutes.map((route) => {
            // Handle wildcard routes
            if (route.includes('*')) {
              const pathPattern = '^' + route.replace(/\*/g, '.*') + '$';
              return { path: pathPattern, method: RequestMethod.ALL };
            }
            return { path: route, method: RequestMethod.ALL };
          }),
        );
      }

      // Apply the middleware to all routes
      middlewareConsumer.forRoutes('*');
    }
  }

  static register(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true, generateId: true },
          interceptor: { mount: true, generateId: true },
          guard: { mount: true, generateId: true },
        }),
      ],
      providers: [this.createOptionsProvider(options)],
    };
  }

  static registerAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true, generateId: true },
          interceptor: { mount: true, generateId: true },
          guard: { mount: true, generateId: true },
        }),
        ...(options.imports || []),
      ],
      providers: [...this.createAsyncProviders(options),],
    };
  }

  static createOptionsProvider(options: LoggerModuleOptions): Provider {
    return {
      provide: LOGGER_MODULE_OPTIONS,
      useValue: options,
    };
  }

  static createAsyncProviders(options: LoggerModuleAsyncOptions): Provider[] {
    if (
      options.useExisting !== undefined ||
      options.useFactory !== undefined ||
      options.useClass !== undefined || 
      options.inject !== undefined
    ) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [];
  }

  static createAsyncOptionsProvider(
    options: LoggerModuleAsyncOptions,
  ): Provider {
    return {
      provide: LOGGER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
