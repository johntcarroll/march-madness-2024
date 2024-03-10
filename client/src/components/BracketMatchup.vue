<script lang="ts" setup>
import { computed } from "vue";
import { useHistoryStore, useMatchupStore, useTeamsStore } from "../store";
const historyStore = useHistoryStore();
const matchupStore = useMatchupStore();
const teamsStore = useTeamsStore();
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});
const matchup = computed(() =>
  matchupStore.matchups.find((matchup) => matchup.id == props.id)
);

const topTeamName =
  matchup.value?.teams[0].length == 1 ? matchup.value?.teams[0][0].team : "?";
const topTeamSeed =
  matchup.value?.teams[0].length == 1 ? matchup.value?.teams[0][0].seed : "#";
const bottomTeamName =
  matchup.value?.teams[1].length == 1 ? matchup.value?.teams[1][0].team : "?";
const bottomTeamSeed =
  matchup.value?.teams[1].length == 1 ? matchup.value?.teams[1][0].seed : "#";

const topLive = computed(
  () => matchup.value?.teams[0].findIndex((team) => team.live) !== -1
);
const bottomLive = computed(
  () => matchup.value?.teams[1].findIndex((team) => team.live) !== -1
);
const topOwned = computed(
  () => matchup.value?.teams[0].findIndex((team) => team.owned) !== -1
);
const bottomOwned = computed(
  () => matchup.value?.teams[1].findIndex((team) => team.owned) !== -1
);
const topClickable = computed(() => matchup.value?.teams[0].length == 1);
const bottomClickable = computed(() => matchup.value?.teams[1].length == 1);
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
</script>
<template>
  <div class="flex flex-column m-2">
    <div class="value-stats flex p-1 pb-0 text-xs">
      <div>L{{ currencyFormatter.format(matchup?.liveValue ?? 0) }}</div>
      <div>O {{ currencyFormatter.format(matchup?.ownedValue ?? 0) }}</div>
    </div>
    <div class="matchup flex flex-column flex-grow-1">
      <div
        class="team top-team text-xs flex align-items-center p-1"
        :class="{ live: topLive, owned: topOwned, clickable: topClickable }"
        @click="
          if (topClickable)
            teamsStore.makeLotLive(
              teamsStore.teamToLotMap.get(matchup?.teams[0][0])
            );
        "
      >
        <div class="text-lg">{{ topTeamSeed }}</div>
        <div class="flex-grow-1 text-center">
          {{ topTeamName }}
        </div>
      </div>
      <div
        class="team bottom-team text-xs flex align-items-center p-1"
        :class="{
          live: bottomLive,
          owned: bottomOwned,
          clickable: bottomClickable,
        }"
        @click="
          if (bottomClickable)
            teamsStore.makeLotLive(
              teamsStore.teamToLotMap.get(matchup?.teams[1][0])
            );
        "
      >
        <div class="text-lg">{{ bottomTeamSeed }}</div>
        <div class="flex-grow-1 text-center">
          {{ bottomTeamName }}
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.matchup {
  height: 60px;
  width: 150px;
  border: 1px solid;
  border-radius: var(--border-radius);
}

.team.clickable:hover {
  cursor: pointer;
  background-color: hsla(160, 100%, 37%, 0.2);
}

.team.live {
  border-color: 0 0 10px rgba(255, 0, 0, 1);
  animation: fadeInOut 2s infinite alternate;
}

.team.owned {
  background-color: rgba(0, 255, 0, 0.15);
}

.matchup > .team {
  flex: 1 1 0;
}

.matchup > .top-team {
  border-bottom: 1px solid;
}

.value-stats {
}

@keyframes fadeInOut {
  0% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 1);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 1);
  }
}
</style>
