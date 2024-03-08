<script lang="ts" setup>
const props = defineProps({
  owner_id: String,
});
</script>
<template>
  <i v-if="owner_id && owner_id == 'other'" class="pi pi-check"></i>
  <i v-if="owner_id && owner_id == 'self'" class="pi pi-dollar"></i>
</template>
<style scoped></style>
