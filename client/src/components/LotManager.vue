<script lang="ts" setup>
import InputNumber from "primevue/inputnumber";
import { computed, ref } from "vue";
import Checkbox from "primevue/checkbox";
import { useTeamsStore } from "../store";
const teamsStore = useTeamsStore();
let realTeam = teamsStore.teams[0];
const teams = computed(() => {
  const ts = teamsStore.teams.filter((team) => team.live);
  return ts;
});
const timeout = ref<null | number>(null);
const updateTeams = async (
  updateKey: "live" | "price" | "sold" | "owned",
  updateValue: number | boolean
) => {
  for (let index = 0; index < teams.value.length; index++) {
    let updateIdx = teamsStore.teams.findIndex(
      (team) => team._id == teams.value[index]._id
    );
    if (updateIdx == -1) throw "error parsing state";
    teamsStore.teams[updateIdx] = {
      ...teams.value[index],
      [updateKey]: updateValue,
    };
  }

  if (timeout.value) clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    await Promise.all(
      teams.value.map(async (team) => {
        await fetch(`http://localhost:3001/teams/${team.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: team.price,
            owned: team.owned,
            sold: team.sold,
          }),
        });
      })
    );
  }, 1000);
};

const ownedModel = computed({
  get() {
    return Boolean(teams.value.find((team) => team.owned));
  },
  set(newOwned: boolean) {
    updateTeams("owned", newOwned);
  },
});

const soldModel = computed({
  get() {
    return Boolean(teams.value.find((team) => team.sold));
  },
  set(newSold: boolean) {
    updateTeams("sold", newSold);
  },
});

const priceModel = computed({
  get() {
    return (teams.value[0]?.price ?? 0) * teams.value.length;
  },
  set(newPrice: number) {
    updateTeams("price", newPrice / teams.value.length);
  },
});
</script>
<template>
  <div class="flex flex-column main-form p-1 m-1" v-if="teams.length > 0">
    <div class="p-2 flex align-items-center justify-content-between">
      <label class="block mb-2" for="owned">Owned</label>
      <Checkbox :binary="true" v-model="ownedModel" />
    </div>
    <div class="p-2 flex align-items-center justify-content-between">
      <label class="block mb-2" for="sold">Sold</label>
      <Checkbox :binary="true" v-model="soldModel" />
    </div>
    <div class="p-2 flex-auto">
      <label for="price" class="mb-2 block">Price</label>
      <InputNumber
        v-model="priceModel"
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    </div>
  </div>
</template>
<style scoped>
.main-form {
  border: 1px solid;
  border-radius: var(--border-radius);
}
</style>
