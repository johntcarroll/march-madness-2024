<script lang="ts" setup>
import { computed } from "vue";
const props = defineProps({
  title: String,
  value: Number,
  rank: Number,
});
function numberToColorGradient(number: number) {
  number = Math.min(Math.max(number, 0), 1);
  const red = Math.floor(255 * number);
  const green = Math.floor(255 * (1 - number));
  return "rgba(" + red + "," + green + ",0, 25%)";
}

const backgroundColor = computed(() =>
  props.rank ? numberToColorGradient((100 * props.rank) / 68 / 100) : "none"
);
</script>
<template>
  <div
    class="tile flex flex-column p-2"
    :style="{ 'background-color': backgroundColor }"
  >
    <div
      class="value-rank flex-grow-1 flex align-items-center justify-content-center gap-2"
    >
      <div class="text-2xl">{{ value }}</div>
      <div class="text-xs">{{ rank }}</div>
    </div>
    <div class="title text-center text-lg">{{ title }}</div>
  </div>
</template>
<style scoped>
.tile {
  height: 150px;
  width: 150px;
  border: 1px solid;
  border-radius: var(--border-radius);
}
</style>
