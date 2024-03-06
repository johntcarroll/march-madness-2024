<script lang="ts" setup>
import Menubar from "primevue/menubar";
import Card from "primevue/card";
import AuctionStats from "./AuctionStats.vue";
import InputText from "primevue/inputtext";
import { useRouter } from "vue-router";
const router = useRouter();
const menuItems = [
  {
    label: "Bracket",
    icon: "pi pi-home",
    command: () => router.push("/"),
  },
  {
    label: "List Teams",
    icon: "pi pi-list",
    command: () => router.push("/teams"),
  },
  {
    label: "Team Dashboard",
    icon: "pi pi-chart-line",
    // todo add bug dropdown here of all teams
    // need to simulate selection sunday first
  },
];
</script>
<template>
  <Card class="bordered">
    <template #content>
      <div class="flex">
        <img src="logo.png" alt="" />
        <div class="flex-grow-1 flex flex-column">
          <AuctionStats class="flex-grow-1" />
          <Menubar :model="menuItems">
            <template #end
              ><InputText
                placeholder="Search"
                type="text"
                class="w-8rem sm:w-auto"
              />
            </template>
          </Menubar>
        </div>
      </div>
    </template>
  </Card>
</template>
<style scoped>
.bordered {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--border-radius);
}
</style>
