import { Test } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { CustomLoggerService } from './services/logger.service';
import { LOGGER_MODULE_OPTIONS } from './constants/module-options.constant';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HttpLoggerMiddleware } from './middlewares/http-logger.middleware';
import { ClsModule } from 'nestjs-cls';

describe('LoggerModule', () => {
  describe('register', () => {
    it('should register the module with provided options', async () => {
      const options = {
        httpLogger: {
          enabled: true,
          exclude: ['/health', '/metrics/*'],
        },
      };

      const module = await Test.createTestingModule({
        imports: [LoggerModule.register(options)],
      }).compile();

      const loggerModule = module.get(LoggerModule);
      const moduleOptions = module.get(LOGGER_MODULE_OPTIONS);
      const loggerService = module.get(CustomLoggerService);

      expect(moduleOptions).toEqual(options);
      expect(loggerService).toBeInstanceOf(CustomLoggerService);
      expect(loggerModule).toBeInstanceOf(LoggerModule);
    });
  });

  describe('registerAsync', () => {
    it('should register the module with async options', async () => {
      const options = {
        httpLogger: {
          enabled: true,
          exclude: ['/health'],
        },
      };

      const module = await Test.createTestingModule({
        imports: [
          LoggerModule.registerAsync({
            useFactory: () => options,
          }),
        ],
      }).compile();

      const moduleOptions = module.get(LOGGER_MODULE_OPTIONS);
      const loggerService = module.get(CustomLoggerService);

      expect(moduleOptions).toEqual(options);
      expect(loggerService).toBeInstanceOf(CustomLoggerService);
    });
  });

  describe('configure', () => {
    let loggerModule: LoggerModule;
    let mockConsumer: jest.Mocked<MiddlewareConsumer>;

    beforeEach(() => {
      mockConsumer = {
        apply: jest.fn().mockReturnThis(),
        exclude: jest.fn().mockReturnThis(),
        forRoutes: jest.fn().mockReturnThis(),
      } as any;
    });

    it('should configure middleware when HTTP logging is enabled', () => {
      const options = {
        httpLogger: {
          enabled: true,
          exclude: ['/health', '/metrics/*'],
        },
      };

      loggerModule = new LoggerModule(options);
      loggerModule.configure(mockConsumer);

      expect(mockConsumer.apply).toHaveBeenCalledWith(HttpLoggerMiddleware);
      expect(mockConsumer.apply().exclude).toHaveBeenCalledWith(
        { path: '/health', method: RequestMethod.ALL },
        { path: '^/metrics/.*$', method: RequestMethod.ALL },
      );
      expect(mockConsumer.apply().forRoutes).toHaveBeenCalledWith('*');
    });

    it('should not configure middleware when HTTP logging is disabled', () => {
      const options = {
        httpLogger: {
          enabled: false,
        },
      };

      loggerModule = new LoggerModule(options);
      loggerModule.configure(mockConsumer);

      expect(mockConsumer.apply).not.toHaveBeenCalled();
      expect(mockConsumer.apply().exclude).not.toHaveBeenCalled();
      expect(mockConsumer.apply().forRoutes).not.toHaveBeenCalled();
    });

    it('should handle empty options', () => {
      loggerModule = new LoggerModule();
      loggerModule.configure(mockConsumer);

      expect(mockConsumer.apply).not.toHaveBeenCalled();
      expect(mockConsumer.apply().exclude).not.toHaveBeenCalled();
      expect(mockConsumer.apply().forRoutes).not.toHaveBeenCalled();
    });
  });

  describe('ClsModule integration', () => {
    it('should include ClsModule with correct configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [LoggerModule.register({})],
      }).compile();

      const clsModule = module.get(ClsModule);
      expect(clsModule).toBeDefined();
    });
  });
});
