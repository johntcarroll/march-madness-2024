<script lang="ts" setup>
import Megamenu from "primevue/Megamenu";
import Card from "primevue/card";
import AuctionStats from "./AuctionStats.vue";
import InputText from "primevue/inputtext";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useTeamsStore } from "../store";
const router = useRouter();
const teamStore = useTeamsStore();
const menuItems = computed(() => {
  const northTeams = teamStore.teams
    .filter((team) => team.region == "north")
    .sort((a, b) => (a.seed ?? 1) - (b.seed ?? 16));
  const southTeams = teamStore.teams
    .filter((team) => team.region == "south")
    .sort((a, b) => (a.seed ?? 1) - (b.seed ?? 16));
  const eastTeams = teamStore.teams
    .filter((team) => team.region == "east")
    .sort((a, b) => (a.seed ?? 1) - (b.seed ?? 16));
  const westTeams = teamStore.teams
    .filter((team) => team.region == "west")
    .sort((a, b) => (a.seed ?? 1) - (b.seed ?? 16));
  const items = [
    [
      {
        label: "North",
        items: northTeams.map(({ seed, team, id }) => ({
          label: `${team} ${seed}`,
          command: () => router.push(`/team/${id}`),
        })),
      },
    ],
    [
      {
        label: "South",
        items: southTeams.map(({ seed, team, id }) => ({
          label: `${team} ${seed}`,
          command: () => router.push(`/team/${id}`),
        })),
      },
    ],
    [
      {
        label: "East",
        items: eastTeams.map(({ seed, team, id }) => ({
          label: `${team} ${seed}`,
          command: () => router.push(`/team/${id}`),
        })),
      },
    ],
    [
      {
        label: "West",
        items: westTeams.map(({ seed, team, id }) => ({
          label: `${team} ${seed}`,
          command: () => router.push(`/team/${id}`),
        })),
      },
    ],
  ];
  return [
    {
      label: "Bracket",
      icon: "pi pi-home",
      command: () => router.push("/"),
    },
    {
      label: "List Teams",
      icon: "pi pi-list",
      command: () => router.push("/teams"),
    },
    {
      label: "Team Dashboard",
      icon: "pi pi-chart-line",
      items,
    },
  ];
});
</script>
<template>
  <Card class="bordered">
    <template #content>
      <div class="flex">
        <img src="logo.png" alt="" />
        <div class="flex-grow-1 flex flex-column">
          <AuctionStats class="flex-grow-1" />
          <Megamenu :model="menuItems"> </Megamenu>
        </div>
      </div>
    </template>
  </Card>
</template>
<style scoped>
.bordered {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--border-radius);
}
</style>
