import { Request, Response, NextFunction } from "express";
export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    if (!req.logger) throw "No Logger";
    const collection = req.database.collection("teams");
    const query = collection.find({ seed: { $ne: null } });
    const teams = await query.toArray();
    req.logger.info(`${teams.length} teams retrieved`);
    res.status(200).json(teams);
    next();
  } catch (e) {
    next(e);
  }
};
