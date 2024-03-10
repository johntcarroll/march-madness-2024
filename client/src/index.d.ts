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
  live: boolean;
  owned: boolean;
  sold: boolean;
  region: string | null;
  seed: number;
  price: null | number;
  wins_rank: number;
  losses_rank: number;
  adjustedEfficiencyMargin_rank: number;
  adjustedOffensiveEfficiency_rank: number;
  adjustedDefensiveEfficiency_rank: number;
  adjustedTempo_rank: number;
  luck_rank: number;
  strengthOfSchedule_rank: number;
  averageOpponentAdjustedOffensiveEfficiency_rank: number;
  averageOpponentAdjustedDefensiveEfficiency_rank: number;
  nonConferenceStrengthOfSchedule_rank: number;
  oddsToAdvance_64_rank: number;
  oddsToAdvance_32_rank: number;
  oddsToAdvance_16_rank: number;
  oddsToAdvance_8_rank: number;
  oddsToAdvance_4_rank: number;
  oddsToAdvance_2_rank: number;
  oddsToAdvance_1_rank: number;
}

declare interface history {
  _id: string;
  name: string;
  seed: number;
  price: number;
  year: number;
}
