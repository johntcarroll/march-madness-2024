import { Request, Response, NextFunction } from "express";
export const postTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    req.logger.info(`updating team`, req.body);
    const collection = req.database.collection("teams");
    const team = await collection.findOne({ id: req.params.id });
    if (team) {
      await collection.updateOne(
        { _id: team._id },
        {
          $set: {
            price: req.body.price,
            owned: Boolean(req.body.owned),
            sold: Boolean(req.body.sold),
          },
        }
      );
      req.logger.info("team updated");
      res.status(200).json({ updated_id: team._id });
    } else if (!team) {
      res.status(404).json({ message: "Team not found" });
    }
    next();
  } catch (e) {
    next(e);
  }
};
