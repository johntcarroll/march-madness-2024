declare global {}
declare interface team {
  _id: string;
  id: string;
  rank: number;
  team: string;
  conference: string;
  wins: number;
  losses: number;
  adjustedEfficiency: number;
  adjustedOffensiveEfficiency: number;
  adjustedDefensiveEfficiency: number;
  adjustedTempo: number;
  luck: number;
  strengthOfSchedule: number;
  averageOpponentAdjustedOffensiveEfficiency: number;
  averageOpponentAdjustedDefensiveEfficiency: number;
  nonConferenceStrengthOfSchedule: number;
  trOriginalTeamName: string;
  oddsToAdvance_64: number;
  oddsToAdvance_32: number;
  oddsToAdvance_16: number;
  oddsToAdvance_8: number;
  oddsToAdvance_4: number;
  oddsToAdvance_2: number;
  oddsToAdvance_1: number;
  areLive: boolean;
  owner_id: null | string;
  region: string | null;
  seed: number | null;
  price: null | number;
}
