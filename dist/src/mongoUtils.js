"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromMongo = exports.connectToMongo = void 0;
const mongodb_1 = require("mongodb");
const connectToMongo = (req, res, next) => {
    const mongoClient = new mongodb_1.MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
    req.database = mongoClient.db("auction");
    next();
};
exports.connectToMongo = connectToMongo;
const disconnectFromMongo = (req, res, next) => {
    if (req.mongoClient)
        req.mongoClient.close();
    next();
};
exports.disconnectFromMongo = disconnectFromMongo;
