<script lang="ts" setup>
const props = defineProps({
  sold: Boolean,
});
</script>
<template>
  <i v-if="sold" class="pi pi-check"></i>
</template>
<style scoped></style>
