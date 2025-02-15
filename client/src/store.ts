import { defineStore } from "pinia";
import { computed, ref, type ComputedRef } from "vue";
const REGION_MAP = {
  north: "east",
  south: "midwest",
  east: "south",
  west: "west",
};

export const PAYOUTS = {
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

  const totalPotByYear = computed(() => {
    return history.value.reduce((acc, history) => {
      if (!acc.has(history.year)) acc.set(history.year, history.price);
      else acc.set(history.year, acc.get(history.year) + history.price);
      return acc;
    }, new Map());
  });

  // decided to only use the last 3 auctions of data for the historical average calcuations here
  const averageHistoricalTotalPot = computed(() => {
    return (
      Array.from(totalPotByYear.value.entries()).reduce((acc, [year, pot]) => {
        if (year == 2023 || year == 2022 || year == 2019) acc = acc + pot;
        return acc;
      }, 0) / 3
    );
  });

  const averagePercentageOfPotBySeedAndYear = computed(() => {
    const years: number[] = Array.from(totalPotByYear.value.keys());
    const popByYear: Record<number, Record<number, number>> = {};
    for (const year of years) {
      popByYear[year] = {};
      for (let seed = 1; seed < 14; seed++) {
        const teamsByYearAndSeed = history.value.filter(
          (history) => history.seed == seed && history.year == year
        );
        const totalPrice = teamsByYearAndSeed.reduce(
          (totalPrice, history) => (totalPrice += history.price),
          0
        );
        const percentageOfPot = totalPrice / totalPotByYear.value.get(year);
        popByYear[year][seed] = percentageOfPot;
      }
      // process packaged seeds
      const packagedTeams = history.value.filter(
        (history) =>
          (history.seed == 14 || history.seed == 15 || history.seed == 16) &&
          history.year == year
      );
      const totalPrice = packagedTeams.reduce(
        (totalPrice, history) => (totalPrice += history.price),
        0
      );
      const percentageOfPot = totalPrice / totalPotByYear.value.get(year);
      popByYear[year][14] = percentageOfPot;
      popByYear[year][15] = percentageOfPot;
      popByYear[year][16] = percentageOfPot;
    }
    return popByYear;
  });

  const averagePercentageOfPotBySeed = computed(() => {
    const totalBySeed: Record<number, number> = Object.values(
      averagePercentageOfPotBySeedAndYear.value
    ).reduce((totalBySeed, yearSeeds) => {
      for (const seed of Object.keys(yearSeeds)) {
        const newKey = Number(seed);
        if (totalBySeed[newKey]) totalBySeed[newKey] += yearSeeds[newKey];
        else totalBySeed[newKey] = yearSeeds[newKey];
      }
      return totalBySeed;
    }, {});
    return Object.entries(totalBySeed).reduce((avgBySeed, [seed, total]) => {
      const newKey = Number(seed);
      avgBySeed[newKey] = total / totalPotByYear.value.size;
      return avgBySeed;
    }, {} as Record<number, number>);
  });

  return {
    history,
    averageHistoricalTotalPot,
    fetchHistory,
    averagePercentageOfPotBySeedAndYear,
    averagePercentageOfPotBySeed,
    totalPotByYear,
  };
});
export const useTeamsStore = defineStore("teams", () => {
  const historyStore = useHistoryStore();
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

  interface lot {
    teams: team[];
    region: string;
    seeds?: number[];
    seed?: number;
  }
  const lots: ComputedRef<lot[]> = computed(() => {
    const noPackageSeeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13];
    return [
      // always one team lots
      ...noPackageSeeds.reduce(
        (
          lots: {
            region: string;
            seed?: number;
            seeds?: number[];
            teams: team[];
          }[],
          seed
        ) => {
          lots.push(
            ...Object.values(REGION_MAP).map((region) => ({
              seed: seed,
              region: region,
              teams: teams.value.filter(
                (team) => team.region == region && team.seed == seed
              ),
            }))
          );
          return lots;
        },
        []
      ),
      ...Object.values(REGION_MAP).map((region) => ({
        region,
        seeds: [14, 15, 16],
        teams: teams.value.filter(
          (team) => team.region == region && [14, 15, 16].includes(team.seed)
        ),
      })),
      {
        region: REGION_MAP.south,
        seed: 10,
        teams: teams.value.filter(
          (team) => team.region == REGION_MAP.south && team.seed == 10
        ),
      },
      {
        region: REGION_MAP.east,
        seed: 10,
        teams: teams.value.filter(
          (team) => team.region == REGION_MAP.east && team.seed == 10
        ),
      },
      {
        region: REGION_MAP.north,
        seed: 10,
        teams: teams.value.filter(
          (team) => team.region == REGION_MAP.north && team.seed == 10
        ),
      },
      {
        region: REGION_MAP.west,
        seed: 10,
        teams: teams.value.filter(
          (team) => team.region == REGION_MAP.west && team.seed == 10
        ),
      },
    ];
  });

  const teamToLotMap = computed(() => {
    const ttpMap = new Map();
    for (const team of teams.value) {
      ttpMap.set(
        team,
        lots.value.find((lot) => lot.teams.includes(team))
      );
    }
    return ttpMap;
  });

  const makeLotLive = (lot: lot) => {
    teams.value.forEach((team) => {
      if (lot.teams.includes(team)) team.live = true;
      else team.live = false;
    });
  };

  const smartValue = computed(() => {
    return teams.value.map((team) => ({
      actual: team.sold ? team.price ?? 0 : 0,
      prediction:
        (historyStore.averagePercentageOfPotBySeed[team.seed] /
          teams.value.filter((t) =>
            team.seed < 14 ? t.seed == team.seed : t.seed > 14
          ).length) *
        historyStore.averageHistoricalTotalPot,
    }));
  });

  const smartPot = computed(() => {
    return smartValue.value.reduce((smartPot, sv) => {
      return smartPot + (sv.actual ? sv.actual : sv.prediction);
    }, 0);
  });

  const liveEv = computed(() => {
    return teams.value
      .filter((team) => team.live)
      .reduce((ev, team) => {
        return (
          smartPot.value *
            (team.oddsToAdvance_1 * PAYOUTS[1] +
              team.oddsToAdvance_2 * PAYOUTS[2] +
              team.oddsToAdvance_4 * PAYOUTS[4] +
              team.oddsToAdvance_8 * PAYOUTS[8] +
              team.oddsToAdvance_16 * PAYOUTS[16]) +
          ev
        );
      }, 0);
  });

  const ownedEv = computed(() => {
    return teams.value
      .filter((team) => team.owned)
      .reduce((ev, team) => {
        return (
          smartPot.value *
            (team.oddsToAdvance_1 * PAYOUTS[1] +
              team.oddsToAdvance_2 * PAYOUTS[2] +
              team.oddsToAdvance_4 * PAYOUTS[4] +
              team.oddsToAdvance_8 * PAYOUTS[8] +
              team.oddsToAdvance_16 * PAYOUTS[16]) +
          ev
        );
      }, 0);
  });

  const totalPot = computed(() => {
    return teams.value.reduce((total, team) => (total += team?.price ?? 0), 0);
  });

  const totalSpend = computed(() => {
    return teams.value
      .filter((team) => team.owned)
      .reduce((total, team) => (total += team?.price ?? 0), 0);
  });
  return {
    teams,
    error,
    loading,
    fetchTeams,
    sortedTeams,
    sortColumn,
    sortDirection,
    lots,
    teamToLotMap,
    makeLotLive,
    smartValue,
    smartPot,
    liveEv,
    ownedEv,
    totalPot,
    totalSpend,
  };
});

const getTeamsBySeedAndRegion = (
  teams: team[],
  seeds: number[],
  region: string
) =>
  teams.filter(
    (team) => team.region == region && seeds.includes(team.seed ?? 0)
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
          [1, 4, 5, 8, 9, 12, 13, 16],
          REGION_MAP.north
        )
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
            0
          ),
        ownedValue: getTeamsBySeedAndRegion(
          teamsStore.teams,
          [1, 4, 5, 8, 9, 12, 13, 16],
          REGION_MAP.north
        )
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.north && team.owned)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
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
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.region == REGION_MAP.east && team.owned)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
          teamsStore.teams.filter((team) => team.region == REGION_MAP.north),
          teamsStore.teams.filter((team) => team.region == REGION_MAP.west),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == REGION_MAP.north ||
                team.region == REGION_MAP.west) &&
              team.live
          )
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_2 * teamsStore.smartPot * PAYOUTS[2]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == REGION_MAP.north ||
                team.region == REGION_MAP.west) &&
              team.owned
          )
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_2 * teamsStore.smartPot * PAYOUTS[2]),
            0
          ),
      },
      // CHAMP
      {
        id: 32,
        teams: [
          teamsStore.teams.filter(
            (team) =>
              team.region == REGION_MAP.north || team.region == REGION_MAP.west
          ),
          teamsStore.teams.filter(
            (team) =>
              team.region == REGION_MAP.east || team.region == REGION_MAP.south
          ),
        ],
        liveValue: teamsStore.teams
          .filter((team) => team.live)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_1 * teamsStore.smartPot * PAYOUTS[1]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter((team) => team.owned)
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_1 * teamsStore.smartPot * PAYOUTS[1]),
            0
          ),
      },
      // FINAL 4
      {
        id: 33,
        teams: [
          teamsStore.teams.filter((team) => team.region == REGION_MAP.east),
          teamsStore.teams.filter((team) => team.region == REGION_MAP.south),
        ],
        liveValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == REGION_MAP.east ||
                team.region == REGION_MAP.south) &&
              team.live
          )
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_2 * teamsStore.smartPot * PAYOUTS[2]),
            0
          ),
        ownedValue: teamsStore.teams
          .filter(
            (team) =>
              (team.region == REGION_MAP.east ||
                team.region == REGION_MAP.south) &&
              team.owned
          )
          .reduce(
            (acc, team) =>
              (acc += team.oddsToAdvance_2 * teamsStore.smartPot * PAYOUTS[2]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
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
              (acc += team.oddsToAdvance_4 * teamsStore.smartPot * PAYOUTS[4]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
              (acc += team.oddsToAdvance_8 * teamsStore.smartPot * PAYOUTS[8]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
                team.oddsToAdvance_16 * teamsStore.smartPot * PAYOUTS[16]),
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
          [getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.west)[0]],
          [getTeamsBySeedAndRegion(teamsStore.teams, [16], REGION_MAP.west)[1]],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 65,
        teams: [
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [10],
              REGION_MAP.south
            )[0],
          ],
          [
            getTeamsBySeedAndRegion(
              teamsStore.teams,
              [10],
              REGION_MAP.south
            )[1],
          ],
        ],
        liveValue: 0,
        ownedValue: 0,
      },
      {
        id: 66,
        teams: [
          [getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.east)[0]],
          [getTeamsBySeedAndRegion(teamsStore.teams, [10], REGION_MAP.east)[1]],
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
