import { MongoClient, Db } from "mongodb";
declare module "express-serve-static-core" {
  interface Request {
    mongoClient?: MongoClient;
    database?: Db;
    logger?: Logger;
  }
}

declare global {
  class Logger {
    info(message: string): void;
    error(message: string, error?: Error): void;
  }
}
