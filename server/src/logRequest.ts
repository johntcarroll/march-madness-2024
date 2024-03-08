import { NextFunction, Request, Response } from "express";
export const logRequestStart = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.logger) throw new Error("Logger not found");
  req.logger.info("", false);
  req.logger.info("--------------------------------", false);
  req.logger.info(
    `[ ${req.method} ] - ${req.path} @ ${Date.now()} from ${req.headers.origin}`
  );
  next();
};

export const logRequestEnd = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.logger) throw new Error("Logger not found");
  req.logger.info("--------------------------------", false);
  req.logger.info("", false);
  next();
};
