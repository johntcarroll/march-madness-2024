"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// this script imports data from the last version of the app and stores it for the new verison of the app
// this is only run onces
const redis_1 = require("redis");
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient("mongodb://localhost:27017");
const redisClient = (0, redis_1.createClient)();
const getHistoryRecordsFromRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield redisClient.keys("history:*");
    const teams = (yield Promise.all(keys.map((key) => redisClient.json.get(key))));
    return teams;
});
const getTeamsFromLastYear = () => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield redisClient.keys("team:*");
    const teams = (yield Promise.all(keys.map((key) => redisClient.json.get(key))));
    return teams;
});
const mapTeamToHistory = (team) => {
    const { name, seed, price } = team;
    return {
        name,
        seed,
        price,
        year: 2023,
    };
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
        const historyRecords = yield getHistoryRecordsFromRedis();
        const teams = yield getTeamsFromLastYear();
        const newHistoryRecords = teams.map(mapTeamToHistory);
        const mongoDb = mongoClient.db("auction");
        const mongoCollection = mongoDb.collection("history");
        yield mongoCollection.insertMany(newHistoryRecords);
        yield mongoCollection.insertMany(historyRecords);
    }
    catch (e) {
        console.log("An Error Occured: ", e);
    }
    finally {
        yield redisClient.quit();
        yield mongoClient.close();
    }
});
main();
