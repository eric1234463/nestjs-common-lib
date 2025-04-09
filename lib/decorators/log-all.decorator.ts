import { Inject } from "@nestjs/common";
import { CustomLoggerService } from "../services/logger.service";
import { asyncLogDescriptorValue, logDescriptorValue, LoggableMethod } from "./log.decorator";

export interface LogAllOptions {
  exclude?: string[];
}

export function LogAll(options: LogAllOptions = {}): ClassDecorator {
  const injectCustomWinstonLoggerService = Inject(CustomLoggerService);
  
  return (target: any) => {
    // Get all methods from the class prototype
    const prototype = target.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(name => {
        // Filter out constructor and non-function properties
        if (name === 'constructor') return false;
        // Filter out excluded methods
        if (options.exclude?.includes(name)) return false;
        return typeof prototype[name] === 'function';
      });

    // Inject logger into the class
    injectCustomWinstonLoggerService(prototype, 'logger');

    // Apply logging to each method
    methodNames.forEach(methodName => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      if (!descriptor) return;

      const originalMethod = descriptor.value as LoggableMethod;
      const isAsync = originalMethod.constructor.name === 'AsyncFunction';

      Object.defineProperty(prototype, methodName, {
        ...descriptor,
        value: isAsync
          ? asyncLogDescriptorValue(prototype, methodName, originalMethod)
          : logDescriptorValue(prototype, methodName, originalMethod),
      });
    });

    return target;
  };
}
