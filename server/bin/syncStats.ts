// this will sync data from https://kenpom.com/ into the main database of teams for this year
// the kenpom team name is the main key for the table, other data sources must map to the team name
// key will be the kenpom team name without spaces or special characters, all lowercase
import { load } from "cheerio";
import { MongoClient, ObjectId } from "mongodb";
import { findBestMatch } from "../src/stringSimilarity";
const rankingsDataFixes = [
  { team: "N Carolina", manual: "northcarolina" },
  { team: "Wash State", manual: "washingtonst" },
  { team: "S Carolina", manual: "southcarolina" },
  { team: "Miss State", manual: "mississippist" },
  { team: "LA Tech", manual: "louisianatech" },
  { team: "E Washingtn", manual: "easternwashington" },
  { team: "E Kentucky", manual: "easternkentucky" },
  { team: "App State", manual: "appalachianst" },
  { team: "NC Central", manual: "northcarolinacentral" },
  { team: "TX Christian", manual: "tcu" },
  { team: "S Methodist", manual: "smu" },
  { team: "TX Southern", manual: "texassouthern" },
  { team: "Kansas City", manual: "umkc" },
  { team: "W Kentucky", manual: "westernkentucky" },
  { team: "W Carolina", manual: "westerncarolina" },
  { team: "TX A&M-CC", manual: "texasamcorpuschris" },
  { team: "S Florida", manual: "southflorida" },
  { team: "IPFW", manual: "purduefortwayne" },
  { team: "N Kentucky", manual: "northernkentucky" },
  { team: "W Illinois", manual: "westernillinois" },
  { team: "S Car State", manual: "southcarolinast" },
  { team: "VA Tech", manual: "virginiatech" },
  { team: "S Illinois", manual: "southernillinois" },
  { team: "UCSB", manual: "ucsantabarbara" },
  { team: "N Iowa", manual: "northerniowa" },
  { team: "TX El Paso", manual: "utep" },
  { team: "N Florida", manual: "northflorida" },
  { team: "E Tenn St", manual: "easttennesseest" },
  { team: "N Alabama", manual: "northalabama" },
  { team: "TN State", manual: "tennesseest" },
  { team: "Alab A&M", manual: "alabamaam" },
  { team: "Maryland ES", manual: "marylandeasternshore" },
  { team: "Miami", manual: "miamifl" },
  { team: "E Illinois", manual: "easternillinois" },
  { team: "Maryland BC", manual: "umbc" },
  { team: "SE Louisiana", manual: "southeasternlouisiana" },
  { team: "Florida Intl", manual: "fiu" },
  { team: "N Arizona", manual: "northernarizona" },
  { team: "N Mex State", manual: "newmexicost" },
  { team: "S Mississippi", manual: "southernmiss" },
  { team: "W Michigan", manual: "westernmichigan" },
  { team: "IL-Chicago", manual: "illinoischicago" },
  { team: "Loyola Mymt", manual: "loyolamarymount" },
  { team: "NW State", manual: "northwesternst" },
  { team: "GA Southern", manual: "georgiasouthern" },
  { team: "TN Tech", manual: "tennesseetech" },
  { team: "GA Tech", manual: "georgiatech" },
  { team: "W Virginia", manual: "westvirginia" },
  { team: "NC A&T", manual: "northcarolinaat" },
  { team: "E Michigan", manual: "easternmichigan" },
  { team: "TX-Pan Am", manual: "utriograndevalley" },
  { team: "UCSD", manual: "ucsandiego" },
  { team: "Miss Val St", manual: "mississippivalleyst" },
  { team: "N Illinois", manual: "northernillinois" },
  { team: "SE Missouri", manual: "southeastmissourist" },
  { team: "S Utah", manual: "southernutah" },
  { team: "S Indiana", manual: "southernindiana" },
  { team: "St Marys", manual: "saintmarys" },
  { team: "U Mass", manual: "massachusetts" },
  { team: "N Colorado", manual: "northerncolorado" },
  { team: "S Alabama", manual: "southalabama" },
  { team: "Geo Wshgtn", manual: "georgewashington" },
  { team: "N Dakota St", manual: "northdakotast" },
  { team: "Sac State", manual: "sacramentost" },
];
const mongoClient = new MongoClient("mongodb://localhost:27017");

interface rankingsDataTeam {
  seed: number;
  oddsToAdvance_64: number;
  oddsToAdvance_32: number;
  oddsToAdvance_16: number;
  oddsToAdvance_8: number;
  oddsToAdvance_4: number;
  oddsToAdvance_2: number;
  oddsToAdvance_1: number;
  team: string;
}

interface rankingsDataWithId extends rankingsDataTeam {
  id: string;
}

interface kenpomDataTeam {
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
}

interface exportDataStructure extends rankingsDataTeam, kenpomDataTeam {
  _id?: ObjectId;
  trOriginalTeamName: string;
  region?: string | null;
  live: boolean;
  owned: boolean;
  available: boolean;
  package: "high-seed" | "playin" | null;
  eliminated: boolean;
}

const getDataFromKenpom = async (): Promise<Array<kenpomDataTeam>> => {
  const request = await fetch("https://kenpom.com");
  const response = await request.text();
  const $ = load(response);
  const allTeamTables = $("#ratings-table").find("tbody");
  const teamData: Array<any> = [];
  allTeamTables.each((index, tbody) => {
    const rows = $(tbody).find("tr");
    rows.each((index, row) => {
      teamData.push({
        id: encodeURIComponent(
          $(row)
            .find("td:nth-child(2)")
            .text()
            .replace(/[^a-zA-Z]/g, "")
            .toLowerCase()
        ),
        rank: Number($(row).find("td:nth-child(1)").text().trim()),
        team: $(row).find("td:nth-child(2)").text().trim(),
        conference: $(row).find("td:nth-child(3)").text().trim(),
        wins: Number(
          $(row).find("td:nth-child(4)").text().trim().split("-")[0]
        ),
        losses: Number(
          $(row).find("td:nth-child(4)").text().trim().split("-")[1]
        ),
        adjustedEfficiency: Number(
          $(row).find("td:nth-child(5)").text().trim()
        ),
        adjustedOffensiveEfficiency: Number(
          $(row).find("td:nth-child(6)").text().trim()
        ),
        adjustedDefensiveEfficiency: Number(
          $(row).find("td:nth-child(8)").text().trim()
        ),
        adjustedTempo: Number($(row).find("td:nth-child(10)").text()),
        luck: Number($(row).find("td:nth-child(12)").text()),
        strengthOfSchedule: Number($(row).find("td:nth-child(14)").text()),
        averageOpponentAdjustedOffensiveEfficiency: Number(
          $(row).find("td:nth-child(16)").text().trim()
        ),
        averageOpponentAdjustedDefensiveEfficiency: Number(
          $(row).find("td:nth-child(18)").text().trim()
        ),
        nonConferenceStrengthOfSchedule: Number(
          $(row).find("td:nth-child(20)").text().trim()
        ),
      });
    });
  });
  return teamData;
};

const getDataFromTeamRankings = async (): Promise<Array<rankingsDataTeam>> => {
  const request = await fetch(
    "https://www.teamrankings.com/ncaa-tournament/bracket-predictions/detail"
  );
  const response = await request.text();
  const $ = load(response);
  const allTeamTable = $(".tr-table.scrollable.datatable").find("tbody")[0];
  const rows = $(allTeamTable).find("tr");
  const teamData: Array<any> = [];
  rows.each((index, row) => {
    const teamName = $(row).find("td:nth-child(3)").find("a").text().trim();
    teamData.push({
      team: teamName,
      seed: Number($(row).find("td:nth-child(1)").text()) || null,
      oddsToAdvance_64:
        Number($(row).find("td:nth-child(6)").text().replace("%", "")) / 100,
      oddsToAdvance_32:
        Number($(row).find("td:nth-child(7)").text().replace("%", "")) / 100,
      oddsToAdvance_16:
        Number($(row).find("td:nth-child(8)").text().replace("%", "")) / 100,
      oddsToAdvance_8:
        Number($(row).find("td:nth-child(9)").text().replace("%", "")) / 100,
      oddsToAdvance_4:
        Number($(row).find("td:nth-child(10)").text().replace("%", "")) / 100,
      oddsToAdvance_2:
        Number($(row).find("td:nth-child(11)").text().replace("%", "")) / 100,
      oddsToAdvance_1:
        Number($(row).find("td:nth-child(12)").text().replace("%", "")) / 100,
    });
  });
  return teamData;
};

const findIdForRankingsData = (
  teamRankingsData: Array<rankingsDataTeam>,
  kenpomData: Array<kenpomDataTeam>
): Array<rankingsDataWithId> => {
  return teamRankingsData.map((trTeam) => {
    const fixedTeamName = rankingsDataFixes.find(
      (rdt) => rdt.team == trTeam.team
    )?.manual;

    const { bestMatch } = findBestMatch(
      fixedTeamName ?? trTeam.team.replace(/[^a-zA-Z]/g, "").toLowerCase(),
      kenpomData.map(({ id }) => id)
    );
    return {
      ...trTeam,
      id: bestMatch.target,
    };
  });
};

const mergeDataSources = (
  kenpomData: kenpomDataTeam[],
  rankingsDataWithIds: rankingsDataWithId[]
): exportDataStructure[] => {
  return kenpomData.map((kpTeam) => {
    const rankingsMatch = rankingsDataWithIds.find(
      (rdTeam) => rdTeam.id === kpTeam.id
    );
    if (!rankingsMatch) {
      throw "Could not find rankings match for " + kpTeam.id;
    }
    const matchingRTeamData = {
      seed: rankingsMatch.seed, // remove this after selection sunday
      trOriginalTeamName: rankingsMatch.team,
      oddsToAdvance_64: rankingsMatch.oddsToAdvance_64,
      oddsToAdvance_32: rankingsMatch.oddsToAdvance_32,
      oddsToAdvance_16: rankingsMatch.oddsToAdvance_16,
      oddsToAdvance_8: rankingsMatch.oddsToAdvance_8,
      oddsToAdvance_4: rankingsMatch.oddsToAdvance_4,
      oddsToAdvance_2: rankingsMatch.oddsToAdvance_2,
      oddsToAdvance_1: rankingsMatch.oddsToAdvance_1,
    };
    return {
      ...kpTeam,
      ...matchingRTeamData,
      _id: new ObjectId(),
      region: null,
      live: false,
      owned: false,
      available: false,
      package:
        matchingRTeamData.seed == 14 ||
        matchingRTeamData.seed == 15 ||
        matchingRTeamData.seed == 16
          ? "high-seed"
          : null,
      eliminated: false,
      // seed: null, // add this after selection sunday
    };
  });
};

const mongoSync = async (teamData: exportDataStructure[]) => {
  const mongoDb = mongoClient.db("auction");
  const mongoCollection = mongoDb.collection("teams");
  for (const team of teamData) {
    const existingQuery = await mongoCollection.find({ id: team.id }).toArray();
    if (existingQuery.length == 1) {
      const teamNo_Id = { ...team };
      delete teamNo_Id._id;
      await mongoCollection.updateOne(
        { id: team.id },
        {
          $set: teamNo_Id,
        }
      );
    } else if (existingQuery.length > 1) {
      throw "There must have been an error.";
    } else {
      await mongoCollection.insertOne(team);
    }
  }
};
/**
 * @param  {exportDataStructure[]} data
 */
const simulateRegions = (data: exportDataStructure[]) => {
  const normal_seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15];
  const five_team_seeds = [11, 12];
  for (const seed of normal_seeds) {
    const teams = data.filter((team) => team.seed == seed);
    if (teams.length !== 4) throw "there was an error";
    teams[0].region = "north";
    teams[1].region = "east";
    teams[2].region = "south";
    teams[3].region = "west";
  }

  for (const seed of five_team_seeds) {
    const teams = data.filter((team) => team.seed == seed);
    if (teams.length !== 5) throw "there was an error";
    teams[0].region = "north";
    teams[1].region = "east";
    teams[2].region = "south";
    teams[3].region = "west";
    teams[3].package = "playin";
    teams[4].region = seed == 11 ? "west" : "east";
    teams[4].package = "playin";
  }
  const teams = data.filter((team) => team.seed == 16);
  if (teams.length !== 6) throw "there was an error";
  teams[0].region = "north";
  teams[1].region = "east";
  teams[2].region = "south";
  teams[3].region = "west";
  teams[3].package = "playin";
  teams[4].region = "north";
  teams[4].package = "playin";
  teams[5].region = "south";
  teams[5].package = "playin";
  return data;
};

const main = async () => {
  try {
    const kenpomData = await getDataFromKenpom();
    const teamRankingsData = await getDataFromTeamRankings();
    const rankingsDataWithIds = findIdForRankingsData(
      teamRankingsData,
      kenpomData
    );
    const combinedData = mergeDataSources(kenpomData, rankingsDataWithIds);
    const simulatedData = simulateRegions(combinedData); // turn this off after selection sunday
    await mongoSync(simulatedData);
  } catch (e) {
    console.log("An Error Occured: ", e);
  } finally {
    await mongoClient.close();
  }
};

main();
