<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useHistoryStore, useTeamsStore, PAYOUTS } from "../store";
import { computed, type ComputedRef } from "vue";
import StatTile from "../components/StatTile.vue";
const teamsStore = useTeamsStore();
const historyStore = useHistoryStore();
const route = useRoute();
const team = computed(() =>
  teamsStore.teams.find((team) => team.id == route.params.id)
);

const stats = computed(() => [
  {
    title: "Adj Eff",
    value: team.value?.adjustedEfficiency,
    rank: team.value?.rank,
  },
  {
    title: "Adj Off Eff",
    value: team.value?.adjustedOffensiveEfficiency,
    rank: team.value?.adjustedOffensiveEfficiency_rank,
  },
  {
    title: "Adj Def Eff",
    value: team.value?.adjustedDefensiveEfficiency,
    rank: team.value?.adjustedDefensiveEfficiency_rank,
  },
  {
    title: "Adj Tempo",
    value: team.value?.adjustedTempo,
    rank: team.value?.adjustedTempo_rank,
  },
  { title: "Luck", value: team.value?.luck, rank: team.value?.luck_rank },
  {
    title: "SOS",
    value: team.value?.strengthOfSchedule,
    rank: team.value?.strengthOfSchedule_rank,
  },
  {
    title: "Opp Off Eff",
    value: team.value?.averageOpponentAdjustedDefensiveEfficiency,
    rank: team.value?.averageOpponentAdjustedDefensiveEfficiency_rank,
  },
  {
    title: "Opp Def Eff",
    value: team.value?.averageOpponentAdjustedDefensiveEfficiency,
    rank: team.value?.averageOpponentAdjustedDefensiveEfficiency_rank,
  },
  {
    title: "Non-Conf SOS",
    value: team.value?.nonConferenceStrengthOfSchedule,
    rank: team.value?.nonConferenceStrengthOfSchedule_rank,
  },
]);

const percentageFormatter = (percentage: number) =>
  (percentage * 100).toFixed(0) + "%";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const actualEv = computed(() => {
  return (
    (team.value?.oddsToAdvance_16 ?? 0) * PAYOUTS[16] * teamsStore.totalPot +
    (team.value?.oddsToAdvance_8 ?? 0) * PAYOUTS[8] * teamsStore.totalPot +
    (team.value?.oddsToAdvance_4 ?? 0) * PAYOUTS[4] * teamsStore.totalPot +
    (team.value?.oddsToAdvance_2 ?? 0) * PAYOUTS[2] * teamsStore.totalPot +
    (team.value?.oddsToAdvance_1 ?? 0) * PAYOUTS[1] * teamsStore.totalPot
  );
});

const actualPayout = computed(() => {
  return (
    PAYOUTS[16] * teamsStore.totalPot +
    PAYOUTS[8] * teamsStore.totalPot +
    PAYOUTS[4] * teamsStore.totalPot +
    PAYOUTS[2] * teamsStore.totalPot +
    PAYOUTS[1] * teamsStore.totalPot
  );
});

const smartEv = computed(() => {
  return (
    (team.value?.oddsToAdvance_16 ?? 0) * PAYOUTS[16] * teamsStore.smartPot +
    (team.value?.oddsToAdvance_8 ?? 0) * PAYOUTS[8] * teamsStore.smartPot +
    (team.value?.oddsToAdvance_4 ?? 0) * PAYOUTS[4] * teamsStore.smartPot +
    (team.value?.oddsToAdvance_2 ?? 0) * PAYOUTS[2] * teamsStore.smartPot +
    (team.value?.oddsToAdvance_1 ?? 0) * PAYOUTS[1] * teamsStore.smartPot
  );
});

const smartPayout = computed(() => {
  return (
    PAYOUTS[16] * teamsStore.smartPot +
    PAYOUTS[8] * teamsStore.smartPot +
    PAYOUTS[4] * teamsStore.smartPot +
    PAYOUTS[2] * teamsStore.smartPot +
    PAYOUTS[1] * teamsStore.smartPot
  );
});

const historicalEv = computed(() => {
  return (
    (team.value?.oddsToAdvance_16 ?? 0) *
      PAYOUTS[16] *
      historyStore.averageHistoricalTotalPot +
    (team.value?.oddsToAdvance_8 ?? 0) *
      PAYOUTS[8] *
      historyStore.averageHistoricalTotalPot +
    (team.value?.oddsToAdvance_4 ?? 0) *
      PAYOUTS[4] *
      historyStore.averageHistoricalTotalPot +
    (team.value?.oddsToAdvance_2 ?? 0) *
      PAYOUTS[2] *
      historyStore.averageHistoricalTotalPot +
    (team.value?.oddsToAdvance_1 ?? 0) *
      PAYOUTS[1] *
      historyStore.averageHistoricalTotalPot
  );
});

const historicalPayout = computed(() => {
  return (
    PAYOUTS[16] * historyStore.averageHistoricalTotalPot +
    PAYOUTS[8] * historyStore.averageHistoricalTotalPot +
    PAYOUTS[4] * historyStore.averageHistoricalTotalPot +
    PAYOUTS[2] * historyStore.averageHistoricalTotalPot +
    PAYOUTS[1] * historyStore.averageHistoricalTotalPot
  );
});

interface iTableData {
  name: string;
  appearanceOdds: string;
  actualEv: string;
  actualPayout: string;
  smartEv: string;
  smartPayout: string;
  historicalEv: string;
  historicalPayout: string;
}

const ROUND_NAME_MAP: Record<16 | 8 | 4 | 2 | 1, string> = {
  16: "Sweet 16",
  8: "Elite 8",
  4: "Final 4",
  2: "Final 2",
  1: "Champion",
};

const tableData: ComputedRef<iTableData[]> = computed(() => {
  return [16, 8, 4, 2, 1].map((round, index, rounds): iTableData => {
    const odds = (team.value as any)?.[`oddsToAdvance_${round}`] ?? 0;
    const payout = rounds
      .filter((r) => r >= round)
      .reduce((payout, r) => (payout += (PAYOUTS as any)[r]), 0);
    const name = (ROUND_NAME_MAP as any)[round];
    return {
      name,
      appearanceOdds: percentageFormatter(odds),
      actualEv: currencyFormatter.format(odds * payout * teamsStore.totalPot),
      actualPayout: currencyFormatter.format(payout * teamsStore.totalPot),
      smartEv: currencyFormatter.format(odds * payout * teamsStore.smartPot),
      smartPayout: currencyFormatter.format(payout * teamsStore.smartPot),
      historicalEv: currencyFormatter.format(
        odds * payout * historyStore.averageHistoricalTotalPot
      ),
      historicalPayout: currencyFormatter.format(
        payout * historyStore.averageHistoricalTotalPot
      ),
    };
  });
});

const headers = [
  "appearence %",
  "actual ev",
  "actual payout",
  "smart ev",
  "smart payout",
  "historical ev",
  "historical payout",
];

type iTableDataProperties = keyof iTableData;

const dataCells: iTableDataProperties[] = [
  "appearanceOdds",
  "actualEv",
  "actualPayout",
  "smartEv",
  "smartPayout",
  "historicalEv",
  "historicalPayout",
];
</script>
<template>
  <div>
    <div class="flex align-items-center">
      <h1 class="mr-4">{{ team?.team }}</h1>
      <div class="record-icon" v-if="team?.live">
        <div class="inner-dot"></div>
      </div>
    </div>
    <div class="stats flex justify-content-around mb-4">
      <StatTile v-for="stat in stats" v-bind="stat" />
    </div>
    <div class="flex justify-content-center">
      <div class="flex flex-column flex-table">
        <div class="flex table-row header-row">
          <div class="blank"></div>
          <div class="header-cell h1" v-for="header in headers">
            {{ header }}
          </div>
        </div>
        <div class="flex table-row data-row" v-for="round in tableData">
          <div class="side-header h1">
            {{ round.name }}
          </div>
          <div class="data-cell" v-for="dataCell in dataCells">
            {{ round[dataCell] }}
          </div>
        </div>
      </div>
    </div>
    <!--
    <div class="flex justify-content-center">
      <table class="table">
        <thead>
          <tr class="border-strong border-bottom">
            <td></td>
            <th>Appearence %</th>
            <th>Actual EV</th>
            <th>Actual Payout</th>
            <th>Smart EV</th>
            <th>Smart Payout</th>
            <th>Historical EV</th>
            <th>Historical Payout</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Sweet 16</th>
            <td>{{ percentageFormatter(team?.oddsToAdvance_16 ?? 0) }}</td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_16 ?? 0) *
                    PAYOUTS[16] *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{ currencyFormatter.format(PAYOUTS[16] * teamsStore.totalPot) }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_16 ?? 0) *
                    PAYOUTS[16] *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{ currencyFormatter.format(PAYOUTS[16] * teamsStore.smartPot) }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_16 ?? 0) *
                    PAYOUTS[16] *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  PAYOUTS[16] * historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
          </tr>
          <tr>
            <th>Elite 8</th>
            <td>{{ percentageFormatter(team?.oddsToAdvance_8 ?? 0) }}</td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_8 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8]) * teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_8 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8]) * teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_8 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
          </tr>
          <tr>
            <th>Final 4</th>
            <td>{{ percentageFormatter(team?.oddsToAdvance_4 ?? 0) }}</td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_4 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) * teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_4 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) * teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_4 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
          </tr>
          <tr>
            <th>Championship</th>
            <td>{{ percentageFormatter(team?.oddsToAdvance_2 ?? 0) }}</td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_2 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_2 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_2 ?? 0) *
                    (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] + PAYOUTS[8] + PAYOUTS[4] + PAYOUTS[2]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
          </tr>
          <tr>
            <th>Champion</th>
            <td>{{ percentageFormatter(team?.oddsToAdvance_1 ?? 0) }}</td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_1 ?? 0) *
                    (PAYOUTS[16] +
                      PAYOUTS[8] +
                      PAYOUTS[4] +
                      PAYOUTS[2] +
                      PAYOUTS[1]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] +
                    PAYOUTS[8] +
                    PAYOUTS[4] +
                    PAYOUTS[2] +
                    PAYOUTS[1]) *
                    teamsStore.totalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_1 ?? 0) *
                    (PAYOUTS[16] +
                      PAYOUTS[8] +
                      PAYOUTS[4] +
                      PAYOUTS[2] +
                      PAYOUTS[1]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] +
                    PAYOUTS[8] +
                    PAYOUTS[4] +
                    PAYOUTS[2] +
                    PAYOUTS[1]) *
                    teamsStore.smartPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (team?.oddsToAdvance_1 ?? 0) *
                    (PAYOUTS[16] +
                      PAYOUTS[8] +
                      PAYOUTS[4] +
                      PAYOUTS[2] +
                      PAYOUTS[1]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
            <td>
              {{
                currencyFormatter.format(
                  (PAYOUTS[16] +
                    PAYOUTS[8] +
                    PAYOUTS[4] +
                    PAYOUTS[2] +
                    PAYOUTS[1]) *
                    historyStore.averageHistoricalTotalPot
                )
              }}
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td>{{ currencyFormatter.format(actualEv) }}</td>
            <td>{{ currencyFormatter.format(estEv) }}</td>
            <td>{{ currencyFormatter.format(historicalEv) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  --></div>
</template>
<style scoped>
.flex-table {
  width: 80vw;
}
.table-row > div {
  flex: 1 1 0;
  text-align: center;
  padding: 1rem;
}

.header-row > .blank {
  border-right: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
}

.header-row > .header-cell {
  border-bottom: 2px solid var(--border-color);
}

.data-row > .side-header {
  border-right: 2px solid var(--border-color);
}

.header-row > .table > thead > tr > th {
  text-transform: uppercase;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 100;
  font-style: normal;
  letter-spacing: 0.1rem;
}

.table > tbody > tr > th {
  text-transform: uppercase;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 100;
  font-style: normal;
  letter-spacing: 0.1rem;
}

.data-cell:hover {
  background-color: var(--border-color);
}

th,
td {
  padding: 1rem;
  text-align: center;
}

.record-icon {
  width: 30px;
  height: 30px;
  border: 2px solid red;
  border-radius: 50%;
  position: relative;
  animation: fadeInOut 2s infinite alternate;
}

.inner-dot {
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeInOut 2s infinite alternate;
}

@keyframes fadeInOut {
  0% {
    opacity: 0; /* Start with transparency */
  }
  50% {
    opacity: 1; /* Fully opaque */
  }
  100% {
    opacity: 0; /* Fade out */
  }
}
</style>
