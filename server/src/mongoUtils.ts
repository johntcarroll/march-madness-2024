import { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";

export const connectToMongo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const mongoClient = new MongoClient(
    process.env.MONGO_URI || "mongodb://localhost:27017"
  );
  req.database = mongoClient.db("auction");
  if (req.logger) req.logger.info("Connected to MongoDB");
  next();
};

export const disconnectFromMongo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.mongoClient) req.mongoClient.close();
  if (req.logger) req.logger.info("Disconnected from MongoDB");
  next();
};
