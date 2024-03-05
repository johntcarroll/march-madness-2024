import { Request, Response, NextFunction } from "express";
export const postTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.database) throw "Not connected to MongoDB";
    const collection = req.database.collection("teams");
    const team = await collection.findOne({ id: req.params.id });
    if (team) {
      await collection.updateOne(
        { _id: team._id },
        {
          $set: {
            seed: req.body.seed,
            region: req.body.region,
            areLive: req.body.areLive,
            price: req.body.price,
            owner_id: req.body.owner_id, // todo get from jwt haha
          },
        }
      );
      res.status(200).json({ updated_id: team._id });
    } else if (!team) {
      res.status(404).json({ message: "Team not found" });
    }
    next();
  } catch (e) {
    next(e);
  }
};
