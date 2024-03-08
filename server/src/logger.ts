import { Request, Response, NextFunction } from "express";
function formatString(input: string): string {
  const desiredLength = 7;
  const paddingLength = Math.max(desiredLength - input.length, 0);
  const padding = " ".repeat(paddingLength);

  return `${input}${padding}`;
}
export class Logger {
  constructor() {
    this.startTime = Date.now();
  }
  private startTime: number;
  public info(message: string, format = true): void {
    const timeElapsed = Date.now() - this.startTime;
    if (format) console.log(`${formatString(`${timeElapsed}ms`)}| ${message}`);
    else console.log(message);
  }

  public error(message: string, e?: Error): void {
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
