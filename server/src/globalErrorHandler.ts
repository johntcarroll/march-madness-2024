import { Request, Response, NextFunction } from "express";
export const handleApiError = (
  e: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.logger) req.logger.error(e.message, e);
  else console.error(e.stack);
  res
    .status(500)
    .send(
      "We're sorry - there was an error processing the request. This error has been logged and passed to the development team."
    );
};
