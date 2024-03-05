import { MongoClient, Collection, Document, OptionalId } from "mongodb";
const mongoClient = new MongoClient("mongodb://localhost:27017");
interface team {
  id: string;
  rank: number;
  team: string;
  conference: string;
  wins: number;
  losses: number;
  adjustedEfficiencyMargin: number;
  adjustedOffensiveEfficiency: number;
  adjustedDefensiveEfficiency: number;
  adjustedTempo: number;
  luck: number;
  strengthOfSchedule: number;
  averageOpponentAdjustedOffensiveEfficiency: number;
  averageOpponentAdjustedDefensiveEfficiency: number;
  nonConferenceStrengthOfSchedule: number;
  trOriginalTeamName: string;
  oddsToAdvance_64: number;
  oddsToAdvance_32: number;
  oddsToAdvance_16: number;
  oddsToAdvance_8: number;
  oddsToAdvance_4: number;
  oddsToAdvance_2: number;
  oddsToAdvance_1: number;
}

interface cacheDocument {
  id: string;
  [key: string]: string | number;
}

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

const clearCache = async (mongoCollection: Collection<Document>) => {
  await mongoCollection.deleteMany({});
  return;
};

const getTeams = async (
  mongoCollection: Collection<Document>
): Promise<team[]> => {
  return (await mongoCollection.find({}).toArray()) as unknown as team[];
};

const rankDocumentsByProperty = (
  documents: team[],
  property: [keyof team, string]
) => {
  const [propertyName, sortDirection] = property;
  documents.sort((a, b) =>
    sortDirection == "desc"
      ? (b[propertyName] as number) - (a[propertyName] as number)
      : (a[propertyName] as number) - (b[propertyName] as number)
  );
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
      ranks.set(doc.id, rank);
    }
    // Otherwise, assign the same rank as the previous document
    else {
      ranks.set(doc.id, prevRank);
    }
    // Increment the rank
    rank++;
  }

  return ranks;
};

const generateCacheDocuments = (
  teams: team[],
  rankingMaps: Map<string, Map<string, number>>
): cacheDocument[] => {
  const cacheDocuments = teams.map((team) => {
    const cacheDocument: cacheDocument = { id: team.id };
    Object.entries(FIELDS_TO_RANK).forEach(([propertyName, direction]) => {
      const fieldMap = rankingMaps.get(propertyName);
      if (!fieldMap) throw "Field Map Not Found! " + propertyName;
      const docRank = fieldMap.get(team.id);
      if (!docRank) throw "Doc Rank Not Found! " + propertyName + team.id;
      cacheDocument[`${propertyName}_rank`] = docRank;
    });
    return cacheDocument;
  });
  return cacheDocuments;
};

const main = async () => {
  try {
    const mongoDb = mongoClient.db("auction");
    const cacheCollection = mongoDb.collection("teamCache");
    const teamCollection = mongoDb.collection("teams");
    await clearCache(cacheCollection);
    const teams = await getTeams(teamCollection);
    const rankingsMaps = Object.entries(FIELDS_TO_RANK).reduce(
      (rms, property): Map<string, object> => {
        rms.set(
          property[0],
          rankDocumentsByProperty(teams, property as [keyof team, string])
        );
        return rms;
      },
      new Map()
    );
    const cacheDocuments = generateCacheDocuments(teams, rankingsMaps);
    await cacheCollection.insertMany(
      cacheDocuments as unknown as OptionalId<Document>[]
    );
  } catch (e) {
    console.log("There was an error warming cache: ", e);
  } finally {
    await mongoClient.close();
  }
};

main();
