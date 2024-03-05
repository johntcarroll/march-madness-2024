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
const mongodb_1 = require("mongodb");
const mongoClient = new mongodb_1.MongoClient("mongodb://localhost:27017");
const FIELDS_TO_RANK = {
    wins: "desc",
    losses: "asc",
    adjustedEfficiencyMargin: "desc",
    adjustedOffensiveEfficiency: "desc",
    adjustedDefensiveEfficiency: "asc",
    adjustedTempo: "desc",
    luck: "desc",
    strengthOfSchedule: "desc",
    averageOpponentAdjustedOffensiveEfficiency: "desc",
    averageOpponentAdjustedDefensiveEfficiency: "asc",
    nonConferenceStrengthOfSchedule: "desc",
    oddsToAdvance_64: "desc",
    oddsToAdvance_32: "desc",
    oddsToAdvance_16: "desc",
    oddsToAdvance_8: "desc",
    oddsToAdvance_4: "desc",
    oddsToAdvance_2: "desc",
    oddsToAdvance_1: "desc",
};
const clearCache = (mongoCollection) => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoCollection.deleteMany({});
    return;
});
const getTeams = (mongoCollection) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield mongoCollection.find({}).toArray());
});
const rankDocumentsByProperty = (documents, property) => {
    const [propertyName, sortDirection] = property;
    documents.sort((a, b) => sortDirection == "desc"
        ? b[propertyName] - a[propertyName]
        : a[propertyName] - b[propertyName]);
    let rank = 1;
    let prevValue = null;
    let prevRank = null;
    const ranks = new Map();
    // Iterate through the sorted documents
    for (const doc of documents) {
        // If the current value is different from the previous value, update the rank
        if (doc[propertyName] !== prevValue) {
            prevValue = doc[propertyName];
            prevRank = rank;
            ranks.set(doc._id, rank);
        }
        // Otherwise, assign the same rank as the previous document
        else {
            ranks.set(doc._id, prevRank);
        }
        // Increment the rank
        rank++;
    }
    return ranks;
};
const generateCacheDocuments = (teams, rankingMaps) => {
    const cacheDocuments = teams.map((team) => {
        const cacheDocument = { _id: team._id };
        Object.entries(FIELDS_TO_RANK).forEach(([propertyName, direction]) => {
            const fieldMap = rankingMaps.get(propertyName);
            if (!fieldMap)
                throw "Field Map Not Found! " + propertyName;
            const docRank = fieldMap.get(team._id);
            if (!docRank)
                throw "Doc Rank Not Found! " + propertyName + team._id;
            cacheDocument[`${propertyName}_rank`] = docRank;
        });
        return cacheDocument;
    });
    return cacheDocuments;
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoDb = mongoClient.db("auction");
        const cacheCollection = mongoDb.collection("teamCache");
        const teamCollection = mongoDb.collection("teams");
        yield clearCache(cacheCollection);
        const teams = yield getTeams(teamCollection);
        const rankingsMaps = Object.entries(FIELDS_TO_RANK).reduce((rms, property) => {
            rms.set(property[0], rankDocumentsByProperty(teams, property));
            return rms;
        }, new Map());
        const cacheDocuments = generateCacheDocuments(teams, rankingsMaps);
        yield cacheCollection.insertMany(cacheDocuments);
    }
    catch (e) {
        console.log("There was an error warming cache: ", e);
    }
    finally {
        yield mongoClient.close();
    }
});
main();
