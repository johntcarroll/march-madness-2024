<script lang="ts" setup>
import { useTeamsStore } from "../store";
import AreLiveCell from "../components/AreLiveCell.vue";
import OwnedCell from "../components/OwnedCell.vue";
import SoldCell from "../components/SoldCell.vue";
import type { Component } from "vue";
import { useRouter } from "vue-router";
const percentageFormatter = (value: any) => `${Math.ceil(value * 100)}%`;
function numberToColorGradient(number: number) {
  number = Math.min(Math.max(number, 0), 1);
  var red = Math.floor(255 * (1 - number));
  var green = Math.floor(255 * number);
  return "rgba(" + red + "," + green + ",0, 25%)";
}
const teamsStore = useTeamsStore();
const router = useRouter();
const columns: {
  field: keyof team;
  header: string;
  formatter?: Function;
  class?: {};
  component?: Component;
  style?: Function;
}[] = [
  {
    field: "rank",
    header: "Rank",
    formatter: (value: any) => `# ${value}`,
    class: { "text-lg": true },
  },
  { field: "seed", header: "Seed" },
  { field: "region", header: "Region" },
  { field: "team", header: "Team" },
  { field: "live", header: "Live", component: AreLiveCell },
  { field: "owned", header: "Owned", component: OwnedCell },
  { field: "sold", header: "Sold", component: SoldCell },
  {
    field: "price",
    header: "Price",
    formatter: (value: any) => `$${value?.toFixed(2) || 0}`,
  },
  { field: "conference", header: "Conf." },
  { field: "wins", header: "Wins" },
  { field: "losses", header: "Losses" },
  {
    field: "oddsToAdvance_32",
    header: "32 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
  {
    field: "oddsToAdvance_16",
    header: "16 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
  {
    field: "oddsToAdvance_8",
    header: "8 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
  {
    field: "oddsToAdvance_4",
    header: "4 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
  {
    field: "oddsToAdvance_2",
    header: "2 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
  {
    field: "oddsToAdvance_1",
    header: "1 %",
    formatter: percentageFormatter,
    style: (value: number) =>
      `background-color: ${numberToColorGradient(value)}`,
  },
];

const sortTeams = (field: keyof team) => {
  if (teamsStore.sortColumn == field) {
    teamsStore.sortDirection =
      teamsStore.sortDirection == "asc" ? "desc" : "asc";
  } else {
    teamsStore.sortColumn = field;
    teamsStore.sortDirection = "asc";
  }
};
</script>
<template>
  <div class="grid p-2">
    <div class="header-row col-12 flex p-3">
      <div
        class="table-cell cursor-pointer text-sm"
        v-for="column in columns"
        @click="sortTeams(column.field)"
      >
        {{ column.header }}
        <i
          class="pi text-xs"
          :class="{
            'pi-sort-alt': column.field !== teamsStore.sortColumn,
            'pi-arrow-down':
              column.field == teamsStore.sortColumn &&
              teamsStore.sortDirection == 'desc',
            'pi-arrow-up':
              column.field == teamsStore.sortColumn &&
              teamsStore.sortDirection == 'asc',
          }"
        />
      </div>
    </div>
    <div
      class="col-12 flex body-row p-3 cursor-pointer"
      v-for="team in teamsStore.sortedTeams"
      @click="router.push(`/team/${team.id}`)"
    >
      <div
        class="table-cell"
        v-for="column in columns"
        :class="column?.class ?? {}"
        :style="column?.style ? column.style(Number(team[column.field as keyof team])) : ''"
      >
        <component
          v-if="column.component"
          :is="column.component"
          v-bind="{[column.field]: team[column.field as keyof team]}"
        />
        <template v-else>
          {{
            column?.formatter
              ? column.formatter(team[column.field as keyof team])
              : team[column.field as keyof team]
          }}
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped>
.table-cell {
  flex: 1 1 0;
  text-align: center;
}

.header-row {
  border-bottom: solid 1px;
  position: sticky;
  top: 0;
  background: #1e1e1e;
  z-index: 10;
}

.grid > div:nth-child(2) {
  margin-top: 15px;
}

.body-row:hover {
  border: 1px solid;
  border-radius: var(--border-radius);
}

.body-row > .table-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: small;
}
</style>
