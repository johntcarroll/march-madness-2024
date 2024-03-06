<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useTeamsStore } from "../store";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
const teamsStore = useTeamsStore();
teamsStore.fetchTeams();
const columns = [
  { field: "rank", header: "Rank" },
  { field: "seed", header: "Seed" },
  { field: "region", header: "Region" },
  { field: "team", header: "Team" },
  { field: "areLive", header: "Live" },
  { field: "owner_id", header: "Owned" },
  { field: "price", header: "Price" },
  { field: "conference", header: "Conference" },
  { field: "wins", header: "Wins" },
  { field: "losses", header: "Losses" },

  { field: "adjustedEfficiency", header: "Adj Eff" },
  {
    field: "adjustedOffensiveEfficiency",
    header: "Adj Off Eff",
  },
  {
    field: "adjustedDefensiveEfficiency",
    header: "Adj Def Eff",
  },
  { field: "adjustedTempo", header: "Adj Tempo" },
  { field: "luck", header: "Luck" },
  { field: "strengthOfSchedule", header: "SOS" },
  {
    field: "averageOpponentAdjustedOffensiveEfficiency",
    header: "Opp Off Eff",
  },
  {
    field: "averageOpponentAdjustedDefensiveEfficiency",
    header: "Opp Def Eff",
  },
  {
    field: "nonConferenceStrengthOfSchedule",
    header: "NC SOS",
  },
];
</script>
<template>
  <div class="grid">
    <div class="col-12 flex gap-1">
      <div
        class="table-cell"
        v-for="header in columns.map(({ header }) => header)"
      >
        {{ header }}
      </div>
    </div>
    <div class="col-12 flex gap-1" v-for="team in teamsStore.teams">
      <div
        class="table-cell"
        v-for="field in columns.map(({ field }) => field as keyof team)"
      >
        {{ team[field] }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.table-cell {
  flex: 1 1 0;
}
</style>
