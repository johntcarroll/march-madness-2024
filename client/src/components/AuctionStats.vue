<script lang="ts" setup>
import { useTeamsStore } from "../store";
import StatTile from "./StatTile.vue";
const teamsStore = useTeamsStore();
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
</script>
<template>
  <div class="flex align-items-center justify-content-around">
    <StatTile
      title="Spend"
      :value="currencyFormatter.format(teamsStore.totalSpend)"
      :size="110"
    />
    <StatTile
      title="Pot"
      :value="currencyFormatter.format(teamsStore.totalPot)"
      :size="110"
    />
    <StatTile
      title="Est Pot"
      :value="currencyFormatter.format(teamsStore.smartPot)"
      :size="110"
    />
    <StatTile
      title="Live EV"
      :value="currencyFormatter.format(teamsStore.liveEv)"
      :size="110"
    />
    <StatTile
      title="Owned EV"
      :value="currencyFormatter.format(teamsStore.ownedEv)"
      :size="110"
    />
  </div>
</template>

<style scoped></style>
