/**
 * HTTP logging options
 */
export interface HttpLoggerOptions {
  /**
   * Enable HTTP logging middleware
   * @default false
   */
  enabled?: boolean;
  exclude?: string[];
}

/**
 * Logger module options
 */
export interface LoggerModuleOptions {
  /**
   * HTTP logging options
   */
  httpLogger?: HttpLoggerOptions;
}

/**
 * Async options for the logger module
 */
export interface LoggerModuleAsyncOptions {
  /**
   * Imports required by the options factory
   */
  imports?: any[];

  /**
   * Factory function that returns the module options
   */
  useFactory: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];

  /**
   * Use an existing provider
   */
  useExisting?: any;

  /**
   * Use a class to create the options
   */
  useClass?: any;
}
