<script lang="ts" setup>
import Header from "./components/Header.vue";
import Card from "primevue/card";
import AuctionStats from "./components/AuctionStats.vue";
</script>

<template>
  <div class="grid">
    <div class="col-12"><Header /></div>
    <div class="col-12"><RouterView /></div>
  </div>
</template>

<style scoped></style>
