<script lang="ts" setup>
const props = defineProps({
  live: Boolean,
});
</script>
<template>
  <div class="record-icon" v-if="live">
    <div class="inner-dot"></div>
  </div>
</template>
<style scoped>
.record-icon {
  width: 30px;
  height: 30px;
  border: 2px solid red;
  border-radius: 50%;
  position: relative;
  animation: fadeInOut 2s infinite alternate;
}

.inner-dot {
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeInOut 2s infinite alternate;
}

@keyframes fadeInOut {
  0% {
    opacity: 0; /* Start with transparency */
  }
  50% {
    opacity: 1; /* Fully opaque */
  }
  100% {
    opacity: 0; /* Fade out */
  }
}
</style>
