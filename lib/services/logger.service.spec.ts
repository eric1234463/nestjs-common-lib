import { Test } from '@nestjs/testing';
import { CustomLoggerService } from './logger.service';
import { ClsService } from 'nestjs-cls';
import winston from 'winston';

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;
  let mockClsService: jest.Mocked<ClsService>;
  let mockWinstonLogger: jest.Mocked<winston.Logger>;

  beforeEach(async () => {
    mockClsService = {
      get: jest.fn(),
    } as any;

    mockWinstonLogger = {
      log: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [CustomLoggerService],
    }).compile();

    service = module.get<CustomLoggerService>(CustomLoggerService);
    service.logger = mockWinstonLogger;
    service.setCls(mockClsService);
  });

  describe('traceId', () => {
    it('should return traceId from ClsService when available', () => {
      const expectedTraceId = 'test-trace-id';
      mockClsService.get.mockReturnValue(expectedTraceId);

      expect(service.traceId).toBe(expectedTraceId);
      expect(mockClsService.get).toHaveBeenCalledWith('traceId');
    });

    it('should return null when ClsService is not available', () => {
      service.setCls(undefined);
      expect(service.traceId).toBeNull();
    });
  });

  describe('log methods', () => {
    const testCases = [
      { method: 'log', level: 'info' },
      { method: 'trace', level: 'debug' },
      { method: 'error', level: 'error' },
      { method: 'warn', level: 'warn' },
    ];

    testCases.forEach(({ method, level }) => {
      describe(`${method}`, () => {
        it(`should log message with ${level} level`, () => {
          const resource = 'TestResource';
          const functionName = 'testFunction';
          const action = 'start';
          const payload = { test: 'data' };
          const traceId = 'test-trace-id';

          mockClsService.get.mockReturnValue(traceId);

          service[method](resource, functionName, action, payload);

          expect(mockWinstonLogger.log).toHaveBeenCalledWith({
            level,
            resource,
            functionName,
            action,
            message: `${resource}-${functionName}-${action}`,
            payload,
            traceId,
          });
        });
      });
    });
  });

  describe('constructor', () => {
    it('should create winston logger with correct configuration', () => {
      const newService = new CustomLoggerService();
      
      expect(newService.logger).toBeDefined();
      expect(newService.logger).toBeInstanceOf(winston.Logger);
    });

    it('should respect DISABLED_LOGGING environment variable', () => {
      process.env.DISABLED_LOGGING = 'true';
      const newService = new CustomLoggerService();
      
      expect(newService.logger.transports[0].silent).toBe(true);
      
      process.env.DISABLED_LOGGING = 'false';
    });
  });
});