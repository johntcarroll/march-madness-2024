<script lang="ts" setup>
const props = defineProps({
  owned: Boolean,
});
</script>
<template>
  <i v-if="owned" class="pi pi-check"></i>
</template>
<style scoped></style>
