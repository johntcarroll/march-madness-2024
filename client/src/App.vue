<script lang="ts" setup>
import Header from "./components/Header.vue";
import Card from "primevue/card";
import AuctionStats from "./components/AuctionStats.vue";
</script>

<template>
  <div class="flex flex-column h-screen">
    <div class="h-25rem"><Header /></div>
    <div class="flex-grow-1 main-content px-2"><RouterView /></div>
  </div>
</template>

<style scoped>
.main-content {
  overflow-y: scroll;
}
</style>
