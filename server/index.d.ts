import { MongoClient, Db } from "mongodb";
declare module "express-serve-static-core" {
  interface Request {
    mongoClient?: MongoClient;
    database?: Db;
    logger?: Logger;
  }
}
