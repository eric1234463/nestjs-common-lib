import { Inject } from '@nestjs/common';
import dayjs, { Dayjs } from 'dayjs';
import { CustomLoggerService } from '../services/logger.service';
import { maskLogArgs, maskLogResult } from '../utils/log';

export interface LoggedMethodContext {
  logger: CustomLoggerService;
}

export type LoggableMethod = (...args: unknown[]) => unknown;

export interface ErrorWithStack extends Error {
  stack?: string;
  message: string;
}

export interface LogErrorPayload {
  args: unknown[];
  executeDuration: number;
  error: {
    stack?: string;
    message: string;
  };
}

export interface LogSuccessPayload {
  args: unknown[];
  result: unknown;
  executeDuration: number;
}

export function Log(): MethodDecorator {
  const injectCustomWinstonLoggerService = Inject(CustomLoggerService);

  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value as LoggableMethod;
    injectCustomWinstonLoggerService(target, 'logger');

    const isAsync = originalMethod.constructor.name === 'AsyncFunction';

    descriptor.value = isAsync 
      ? asyncLogDescriptorValue(target, propertyKey, originalMethod)
      : logDescriptorValue(target, propertyKey, originalMethod);

    return descriptor;
  };
}

export const asyncLogDescriptorValue = (
  target: object,
  propertyKey: string | symbol,
  originalMethod: LoggableMethod,
): LoggableMethod => {
  return async function(this: LoggedMethodContext, ...args: unknown[]): Promise<unknown> {
    const { logger } = this;
    const startedAt: Dayjs = dayjs();
    const newArgs = maskLogArgs(args);
    const className = target.constructor.name;

    try {
      logger.log(className, propertyKey.toString(), 'start', {
        args: newArgs,
      });

      const result = await originalMethod.apply(this, args);
      
      logger.log(className, propertyKey.toString(), 'end', {
        result: maskLogResult(result),
        args: newArgs,
        executeDuration: dayjs().diff(startedAt),
      } as LogSuccessPayload);

      return result;
    } catch (error) {
      const errorPayload: LogErrorPayload = {
        args: newArgs,
        executeDuration: dayjs().diff(startedAt),
        error: {
          stack: (error as ErrorWithStack)?.stack,
          message: (error as ErrorWithStack)?.message,
        },
      };

      logger.error(className, propertyKey.toString(), 'end', errorPayload);
      throw error;
    }
  };
};

export const logDescriptorValue = (
  target: object,
  propertyKey: string | symbol,
  originalMethod: LoggableMethod,
): LoggableMethod => {
  return function(this: LoggedMethodContext, ...args: unknown[]): unknown {
    const { logger } = this;
    const startedAt: Dayjs = dayjs();
    const newArgs = maskLogArgs(args);
    const className = target.constructor.name;

    try {
      logger.log(className, propertyKey.toString(), 'start', {
        args: newArgs,
      });

      const result = originalMethod.apply(this, args);

      logger.log(className, propertyKey.toString(), 'end', {
        args: newArgs,
        result: maskLogResult(result),
        executeDuration: dayjs().diff(startedAt),
      } as LogSuccessPayload);

      return result;
    } catch (error) {
      const errorPayload: LogErrorPayload = {
        args: newArgs,
        executeDuration: dayjs().diff(startedAt),
        error: {
          stack: (error as ErrorWithStack)?.stack,
          message: (error as ErrorWithStack)?.message,
        },
      };

      logger.error(className, propertyKey.toString(), 'end', errorPayload);
      throw error;
    }
  };
};
