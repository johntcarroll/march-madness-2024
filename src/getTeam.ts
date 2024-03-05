import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    // get the team
    const teamsCollection = req.database.collection("teams");
    const team = await teamsCollection.findOne({ id: req.params.id });
    // get the cached statistics
    const cacheCollection = req.database.collection("teamCache");
    const cachedTeam = await cacheCollection.findOne({ id: req.params.id });
    if (!team || !cachedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ ...team, ...cachedTeam });
    next();
  } catch (e) {
    next(e);
  }
};
