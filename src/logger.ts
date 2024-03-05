import { Request, Response, NextFunction } from "express";
export class Logger {
  info(message: string): void {
    console.log(message);
  }

  error(message: string, e?: Error): void {
    console.error(message, e);
  }
}

export const loggerConnect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logger = new Logger();
  next();
};
