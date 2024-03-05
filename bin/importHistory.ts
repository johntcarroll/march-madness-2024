// this script imports data from the last version of the app and stores it for the new verison of the app
// this is only run onces
import { createClient } from "redis";
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient("mongodb://localhost:27017");
const redisClient = createClient();

const getHistoryRecordsFromRedis = async () => {
  const keys = await redisClient.keys("history:*");
  const teams = (await Promise.all(
    keys.map((key) => redisClient.json.get(key))
  )) as any;
  return teams;
};

const getTeamsFromLastYear = async () => {
  const keys = await redisClient.keys("team:*");
  const teams = (await Promise.all(
    keys.map((key) => redisClient.json.get(key))
  )) as any;
  return teams;
};

const mapTeamToHistory = (team: {
  name: String;
  seed: Number;
  price: Number;
}): {
  name: String;
  seed: Number;
  price: Number;
  year: Number;
} => {
  const { name, seed, price } = team;
  return {
    name,
    seed,
    price,
    year: 2023,
  };
};

const main = async () => {
  try {
    await redisClient.connect();
    const historyRecords = await getHistoryRecordsFromRedis();
    const teams = await getTeamsFromLastYear();
    const newHistoryRecords = teams.map(mapTeamToHistory);
    const mongoDb = mongoClient.db("auction");
    const mongoCollection = mongoDb.collection("history");
    await mongoCollection.insertMany(newHistoryRecords);
    await mongoCollection.insertMany(historyRecords);
  } catch (e) {
    console.log("An Error Occured: ", e);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

main();
