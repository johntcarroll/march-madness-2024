import { Request, Response, NextFunction } from "express";
export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    if (!req.logger) throw "No Logger";
    const collection = req.database.collection("history");
    const query = collection.find({});
    const history = await query.toArray();
    req.logger.info(`${history.length} items retrieved`);
    res.status(200).json(history);
    next();
  } catch (e) {
    next(e);
  }
};
