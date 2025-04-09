import { Injectable, LoggerService } from "@nestjs/common";
import { ClsService, ClsModule, ClsStore } from "nestjs-cls";
import winston from "winston";
import CircularJSON from "circular-json";

type Action = "start" | "end";

export type { ClsService, ClsModule, ClsStore };

@Injectable()
export class CustomLoggerService implements LoggerService {
  logger: winston.Logger;
  private cls: ClsService | undefined;

  constructor() {
    const { transports, format } = winston;
    const { combine, printf } = format;
    const levels = {
      error: 0,
      warn: 1,
      debug: 2,
      info: 3,
    };
    const customFormat = combine(
      printf((info) => {
        const { level, message, ...args } = info;
        return CircularJSON.stringify(
          {
            level, // Grafana determines log level by the first match
            ...args,
            message,
          },
          (key, value) => {
            return typeof value === "bigint" ? value.toString() : value; // return everything else unchanged
          }
        );
      })
    );
    this.logger = winston.createLogger({
      levels,
      transports: [
        new transports.Console({
          format: customFormat,
          silent: process.env.DISABLED_LOGGING === "true" || false,
        }),
      ],
    });
  }

  setCls(cls: ClsService) {
    this.cls = cls;
  }

  get traceId() {
    return this.cls?.get("traceId") || null;
  }

  log(resource: string, functionName: string, action: Action, payload: any) {
    return this.logger.log({
      level: "info",
      resource,
      functionName,
      action,
      message: `${resource}-${functionName}-${action}`,
      payload,
      traceId: this.traceId,
    });
  }

  trace(resource: string, functionName: string, action: Action, payload: any) {
    return this.logger.log({
      level: "debug",
      resource,
      functionName,
      action,
      message: `${resource}-${functionName}-${action}`,
      payload,
      traceId: this.traceId,
    });
  }

  error(resource: string, functionName: string, action: string, payload: any) {
    return this.logger.log({
      level: "error",
      resource,
      functionName,
      action,
      message: `${resource}-${functionName}-${action}`,
      payload,
      traceId: this.traceId,
    });
  }

  warn(resource: string, functionName: string, action: string, payload: any) {
    return this.logger.log({
      level: "warn",
      resource,
      functionName,
      action,
      message: `${resource}-${functionName}-${action}`,
      payload,
      traceId: this.traceId,
    });
  }
}
