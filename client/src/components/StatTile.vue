<script lang="ts" setup>
import { computed } from "vue";
const props = defineProps({
  title: String,
  value: [Number, String],
  rank: {
    type: [Number],
    default: 0,
  },
  size: {
    type: Number,
    default: 150,
  },
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
    :style="{
      'background-color': backgroundColor,
      height: size + 'px',
      width: size + 'px',
    }"
  >
    <div
      class="value-rank flex-grow-1 flex align-items-center justify-content-center gap-2"
    >
      <div class="h4">{{ value }}</div>
      <div class="text-xs h4" v-if="rank">{{ rank }}</div>
    </div>
    <div class="title text-center h4">{{ title }}</div>
  </div>
</template>
<style scoped>
.tile {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--border-radius);
}
</style>
