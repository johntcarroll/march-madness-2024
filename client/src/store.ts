import { defineStore } from "pinia";
import { ref } from "vue";
export const useTeamsStore = defineStore("teams", () => {
  const teams = ref<team[]>([]);
  const error = ref<Error | null>(null);
  const loading = ref(false);
  const fetchTeams = async () => {
    loading.value = true;
    try {
      if (teams.value.length > 0) return;
      const res = await fetch("http://localhost:3001/teams");
      const data = await res.json();
      teams.value = data;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };
  return { teams, error, loading, fetchTeams };
});
