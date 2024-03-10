import { Request, Response, NextFunction } from "express";
export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    if (!req.logger) throw "No Logger";
    const teamsCollection = req.database.collection("teams");
    const teamsQuery = teamsCollection.find({ seed: { $ne: null } });
    const teams = await teamsQuery.toArray();

    const cacheCollection = req.database.collection("teamCache");
    const cacheQuery = cacheCollection.find();
    const caches = await cacheQuery.toArray();

    const teamsWithCache = teams.map((team) => ({
      ...caches.find((cache) => cache.id == team.id),
      ...team,
    }));

    req.logger.info(`${teams.length} teams retrieved`);
    res.status(200).json(teamsWithCache);
    next();
  } catch (e) {
    next(e);
  }
};
