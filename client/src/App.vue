<script lang="ts" setup>
import Header from "./components/Header.vue";
import { useTeamsStore, useHistoryStore } from "./store";
const teamsStore = useTeamsStore();
const historyStore = useHistoryStore();
teamsStore.fetchTeams();
historyStore.fetchHistory();
</script>

<template>
  <div class="flex flex-column h-screen">
    <div class="p-2"><Header /></div>
    <div class="flex-grow-1 main-content px-2"><RouterView /></div>
  </div>
</template>

<style scoped>
.main-content {
  overflow-y: scroll;
}
</style>
