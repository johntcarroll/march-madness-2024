<script lang="ts" setup>
import BracketMatchup from "../components/BracketMatchup.vue";
import { useTeamsStore } from "../store";
const teamsStore = useTeamsStore();
</script>
<template>
  <div class="flex flex-column" v-if="!teamsStore.loading && !teamsStore.error">
    <div class="flex justify-content-around text-center flex-grow-1 header-row">
      <div>1st Round</div>
      <div>2nd Round</div>
      <div>Sweet 16</div>
      <div>Elite 8</div>
      <div>Final 4</div>
      <div>Championship</div>
      <div>Final 4</div>
      <div>Elite 8</div>
      <div>Sweet 16</div>
      <div>2nd Round</div>
      <div>1st Round</div>
    </div>
    <div class="flex flex-grow-1 justify-content-around round-matchups">
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="1" />
        <BracketMatchup :id="2" />
        <BracketMatchup :id="3" />
        <BracketMatchup :id="4" />
        <BracketMatchup :id="5" />
        <BracketMatchup :id="6" />
        <BracketMatchup :id="7" />
        <BracketMatchup :id="8" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="9" />
        <BracketMatchup :id="10" />
        <BracketMatchup :id="11" />
        <BracketMatchup :id="12" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="13" />
        <BracketMatchup :id="14" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="15" />
      </div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="16" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="17" />
        <BracketMatchup :id="18" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="19" />
        <BracketMatchup :id="20" />
        <BracketMatchup :id="21" />
        <BracketMatchup :id="22" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="23" />
        <BracketMatchup :id="24" />
        <BracketMatchup :id="25" />
        <BracketMatchup :id="26" />
        <BracketMatchup :id="27" />
        <BracketMatchup :id="28" />
        <BracketMatchup :id="29" />
        <BracketMatchup :id="30" />
      </div>
    </div>
    <div class="round-matchups flex flex-grow-1">
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="31" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="32" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="33" />
      </div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
    </div>
    <div class="flex flex-grow-1 justify-content-around round-matchups">
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="34" />
        <BracketMatchup :id="35" />
        <BracketMatchup :id="36" />
        <BracketMatchup :id="37" />
        <BracketMatchup :id="38" />
        <BracketMatchup :id="39" />
        <BracketMatchup :id="40" />
        <BracketMatchup :id="41" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="42" />
        <BracketMatchup :id="43" />
        <BracketMatchup :id="44" />
        <BracketMatchup :id="45" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="46" />
        <BracketMatchup :id="47" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="48" />
      </div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup"></div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="49" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="50" />
        <BracketMatchup :id="51" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="52" />
        <BracketMatchup :id="53" />
        <BracketMatchup :id="54" />
        <BracketMatchup :id="55" />
      </div>
      <div class="flex flex-column round-matchup">
        <BracketMatchup :id="56" />
        <BracketMatchup :id="57" />
        <BracketMatchup :id="58" />
        <BracketMatchup :id="59" />
        <BracketMatchup :id="60" />
        <BracketMatchup :id="61" />
        <BracketMatchup :id="62" />
        <BracketMatchup :id="63" />
      </div>
    </div>
    <div
      class="center-gap round-matchups flex flex-grow-1 justify-content-center"
    >
      <BracketMatchup :id="64" /><BracketMatchup :id="65" /><BracketMatchup
        :id="66"
      /><BracketMatchup :id="67" />
    </div>
  </div>
</template>
<style scoped>
.round-matchups > .round-matchup {
  flex: 1 1 0;
  align-items: center;
  justify-content: space-around;
}
.round-matchups > .round-matchup.final-4-top {
  justify-content: end;
}
.round-matchups > .round-matchup.final-4-bottom {
  justify-content: start;
}

.header-row > div {
  flex: 1 1 0;
}
</style>
