<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useTeamsStore } from "../store";
import { computed } from "vue";
import StatTile from "../components/StatTile.vue";
const teamsStore = useTeamsStore();
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
</script>
<template>
  <div>
    <h1>{{ team?.team }}</h1>
    <div class="stats flex justify-content-around">
      <StatTile v-for="stat in stats" v-bind="stat" />
    </div>
  </div>
</template>
<style scoped></style>
