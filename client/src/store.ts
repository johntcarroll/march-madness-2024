import { defineStore } from "pinia";
import { computed, ref } from "vue";
const REGION_MAP = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
};

const PAYOUTS = {
  1: 0.2, // pot / 5
  2: 0.1, // pot / 5 / 2
  4: 0.05, // pot / 5 / 4
  8: 0.025, // pot / 5 / 8
  16: 0.0125, // pot / 5 / 16
};

export const useHistoryStore = defineStore("history", () => {
  const history = ref<history[]>([]);
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const fetchHistory = async () => {
    loading.value = true;
    try {
      if (history.value.length > 0) return;
      const res = await fetch("http://localhost:3001/history");
      const data = await res.json();
      history.value = data;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  // decided to only use the last 3 auctions of data for the historical average calcuations here
  const averageHistoricalTotalPot = computed(() => {
    const totalPotByYear = history.value
      .filter(
        (history) =>
          history.year == 2023 || history.year == 2022 || history.year == 2019
      )
      .reduce((acc, history) => {
        if (!acc.has(history.year)) acc.set(history.year, history.price);
        acc.set(history.year, acc.get(history.year) + history.price);
        return acc;
      }, new Map());
    return (
      Array.from(totalPotByYear.values()).reduce((acc, val) => acc + val, 0) /
      totalPotByYear.size
    );
  });

  return { history, averageHistoricalTotalPot, fetchHistory };
});
export const useTeamsStore = defineStore("teams", () => {
  const teams = ref<team[]>([]);
  const error = ref<Error | null>(null);
  const loading = ref(false);
  const sortColumn = ref<keyof team>("rank");
  const sortDirection = ref<"asc" | "desc">("asc");

  const fetchTeams = async () => {
    loading.value = true;
    try {
      if (teams.value.length > 0) return;
      const res = await fetch("http://localhost:3001/teams");
      const data = await res.json();
      teams.value = data;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };
  const sortedTeams = computed(() => {
    if (!teams.value) return [];
    return [...teams.value].sort((a, b) => {
      if (sortDirection.value == "asc")
        return (a?.[sortColumn.value] ?? 1) > (b?.[sortColumn.value] ?? 0)
          ? 1
          : -1;
      else
        return (a?.[sortColumn.value] ?? 0) > (b?.[sortColumn.value] ?? 1)
          ? -1
          : 1;
    });
  });
  return {
    teams,
    error,
    loading,
    fetchTeams,
    sortedTeams,
    sortColumn,
    sortDirection,
  };
});

const getTeamsBySeedAndRegion = (
  teams: team[],
  seeds: number[],
  region: string
) =>
  teams.filter(
    (team) =>
      team.region == region &&
      seeds.includes(team.seed ?? 0) &&
      team.eliminated == false
  );

export const useMatchupStore = defineStore("matchups", () => {
  const teamsStore = useTeamsStore();
  const historyStore = useHistoryStore();
  const matchups = computed(() => {
    const coreMatchups = [
      {
        id: 1,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 2,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [8], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [9], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 3,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 4,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [4], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [13], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 5,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 6,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [3], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [14], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 7,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 8,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [2], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [15], REGION_MAP.north),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 9,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1, 16], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [8, 9], REGION_MAP.north),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 10,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5, 12], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [4, 13], REGION_MAP.north),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 11,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6, 11], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [3, 14], REGION_MAP.north),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 12,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7, 10], REGION_MAP.north),
          getTeamsBySeedAndRegion(teamsStore.teams, [2, 15], REGION_MAP.north),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 13,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 8, 9, 16],
            REGION_MAP.north
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [4, 5, 12, 13],
            REGION_MAP.north
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 14,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [3, 6, 11, 14],
            REGION_MAP.north
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 7, 10, 15],
            REGION_MAP.north
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 15,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 4, 5, 8, 9, 12, 13, 16],
            REGION_MAP.north
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 3, 6, 7, 10, 11, 14, 15],
            REGION_MAP.north
          ),
        ],
        liveValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.north && team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.north && team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
      },
      {
        id: 16,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 4, 5, 8, 9, 12, 13, 16],
            REGION_MAP.east
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 3, 6, 7, 10, 11, 14, 15],
            REGION_MAP.east
          ),
        ],
        liveValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.east && team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.east && team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
      },
      {
        id: 17,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 8, 9, 16],
            REGION_MAP.east
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [4, 5, 12, 13],
            REGION_MAP.east
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 18,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [3, 6, 11, 14],
            REGION_MAP.east
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 7, 10, 15],
            REGION_MAP.east
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 19,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1, 16], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [8, 9], REGION_MAP.east),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 20,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5, 12], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [4, 13], REGION_MAP.east),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 21,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6, 11], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [3, 14], REGION_MAP.east),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 22,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7, 10], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [2, 15], REGION_MAP.east),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.east
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.east
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 23,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 24,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [8], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [9], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 25,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 26,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [4], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [13], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 27,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 28,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [3], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [14], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 29,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 30,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [2], REGION_MAP.east),
          getTeamsBySeedAndRegion(teamsStore.teams, [15], REGION_MAP.east),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      // FINAL 4
      {
        id: 31,
        teams: [
          teamsStore.teams.filter((team) => team.region == "north"),
          teamsStore.teams.filter((team) => team.region == "west"),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == "north" || team.region == "west") && team.live
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == "north" || team.region == "west") && team.owned
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
      },
      // CHAMP
      {
        id: 32,
        teams: [
          teamsStore.teams.filter(
            (team) => team.region == "north" || team.region == "west"
          ),
          teamsStore.teams.filter(
            (team) => team.region == "east" || team.region == "south"
          ),
        ],
        liveValue: teamsStore.teams
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
      },
      // FINAL 4
      {
        id: 33,
        teams: [
          teamsStore.teams.filter((team) => team.region == "west"),
          teamsStore.teams.filter((team) => team.region == "south"),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == "north" || team.region == "west") && team.live
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == "north" || team.region == "west") && team.owned
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[2]),
            0
          ),
      },

      {
        id: 34,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 35,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [8], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [9], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 36,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 37,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [4], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [13], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 38,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 39,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [3], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [14], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 40,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 41,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [2], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [15], REGION_MAP.west),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 42,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1, 16], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [8, 9], REGION_MAP.west),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 43,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5, 12], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [4, 13], REGION_MAP.west),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 44,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6, 11], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [3, 14], REGION_MAP.west),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 45,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7, 10], REGION_MAP.west),
          getTeamsBySeedAndRegion(teamsStore.teams, [2, 15], REGION_MAP.west),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 46,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 8, 9, 16],
            REGION_MAP.west
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [4, 5, 12, 13],
            REGION_MAP.west
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 47,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [3, 6, 11, 14],
            REGION_MAP.west
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 7, 10, 15],
            REGION_MAP.west
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.west
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.west
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 48,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 4, 5, 8, 9, 12, 13, 16],
            REGION_MAP.west
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 3, 6, 7, 10, 11, 14, 15],
            REGION_MAP.west
          ),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              team.region == REGION_MAP.west && (team.live || team.owned)
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
      },
      {
        id: 49,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 4, 5, 8, 9, 12, 13, 16],
            REGION_MAP.south
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 3, 6, 7, 10, 11, 14, 15],
            REGION_MAP.south
          ),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              team.region == REGION_MAP.south && (team.live || team.owned)
          )
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[4]),
            0
          ),
      },
      {
        id: 50,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [1, 8, 9, 16],
            REGION_MAP.south
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [4, 5, 12, 13],
            REGION_MAP.south
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 6, 7, 12, 13, 16],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 51,
        teams: [
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [3, 6, 11, 14],
            REGION_MAP.south
          ),
          getTeamsBySeedAndRegion(
            teamsStore.teams,
            [2, 7, 10, 15],
            REGION_MAP.south
          ),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 3, 6, 7, 10, 11, 14, 15],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[8]),
            0
          ),
      },
      {
        id: 52,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1, 16], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [8, 9], REGION_MAP.south),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 8, 9, 16],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 53,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5, 12], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [4, 13], REGION_MAP.south),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [4, 5, 12, 13],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 54,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6, 11], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [3, 14], REGION_MAP.south),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [3, 6, 11, 14],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 55,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7, 10], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [2, 15], REGION_MAP.south),
        ],
        liveValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.south
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [2, 7, 10, 15],
          REGION_MAP.south
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc +=
                team.oddsToAdvance_16 *
                historyStore.averageHistoricalTotalPot *
                PAYOUTS[16]),
            0
          ),
      },
      {
        id: 56,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [1], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 57,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [8], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [9], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 58,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [5], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 59,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [4], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [13], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 60,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [6], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 61,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [3], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [14], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 62,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [7], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 63,
        teams: [
          getTeamsBySeedAndRegion(teamsStore.teams, [2], REGION_MAP.south),
          getTeamsBySeedAndRegion(teamsStore.teams, [15], REGION_MAP.south),
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      // playin
      {
        id: 64,
        teams: [
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [16],
              REGION_MAP.north
            )[0],
          ],
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [16],
              REGION_MAP.north
            )[1],
          ],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 65,
        teams: [
          [getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.west)[0]],
          [getTeamsBySeedAndRegion(teamsStore.teams, [11], REGION_MAP.west)[1]],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 66,
        teams: [
          [getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.east)[0]],
          [getTeamsBySeedAndRegion(teamsStore.teams, [12], REGION_MAP.east)[1]],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 67,
        teams: [
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [16],
              REGION_MAP.south
            )[0],
          ],
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [16],
              REGION_MAP.south
            )[1],
          ],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
    ];

    return coreMatchups;
  });
  return { matchups };
});
