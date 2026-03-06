export type EvolutionStage = "base" | "middle" | "final";

export interface TeamFilters {
  game: string | null;
  generations: number[];
  types: string[];
  evolutionStages: EvolutionStage[];
}

export interface GameInfo {
  name: string;
  generations: number[];
}

// Liste des jeux et leurs générations disponibles
export const GAMES: Record<string, GameInfo> = {
  red: { name: "Red/Blue/Yellow", generations: [1] },
  firered: { name: "FireRed/LeafGreen", generations: [1] },
  gold: { name: "Gold/Silver/Crystal", generations: [1, 2] },
  heartgold: { name: "HeartGold/SoulSilver", generations: [1, 2] },
  ruby: { name: "Ruby/Sapphire/Emerald", generations: [1, 2, 3] },
  omegaa: { name: "Omega Ruby/Alpha Sapphire", generations: [1, 2, 3] },
  diamond: { name: "Diamond/Pearl/Platinum", generations: [1, 2, 3, 4] },
  bdsp: { name: "Brilliant Diamond/Shining Pearl", generations: [1, 2, 3, 4] },
  black: { name: "Black/White/Black 2/White 2", generations: [1, 2, 3, 4, 5] },
  xy: { name: "X/Y", generations: [1, 2, 3, 4, 5, 6] },
  sun: {
    name: "Sun/Moon/Ultra Sun/Ultra Moon",
    generations: [1, 2, 3, 4, 5, 6, 7],
  },
  sword: { name: "Sword/Shield", generations: [1, 2, 3, 4, 5, 6, 7, 8] },
  scarlet: { name: "Scarlet/Violet", generations: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

export interface GenerationInfo {
  start: number;
  end: number;
  region: string;
}

// Plages d'ID pour chaque génération et leur région
export const GENERATIONS: Record<number, GenerationInfo> = {
  1: { start: 1, end: 151, region: "Kanto" },
  2: { start: 152, end: 251, region: "Johto" },
  3: { start: 252, end: 386, region: "Hoenn" },
  4: { start: 387, end: 493, region: "Sinnoh" },
  5: { start: 494, end: 649, region: "Unova" },
  6: { start: 650, end: 721, region: "Kalos" },
  7: { start: 722, end: 809, region: "Alola" },
  8: { start: 810, end: 905, region: "Galar" },
  9: { start: 906, end: 1025, region: "Paldea" },
};

export const TYPE_FR: Record<string, string> = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  electric: "Électrik",
  grass: "Plante",
  ice: "Glace",
  fighting: "Combat",
  poison: "Poison",
  ground: "Sol",
  flying: "Vol",
  psychic: "Psy",
  bug: "Insecte",
  rock: "Roche",
  ghost: "Spectre",
  dragon: "Dragon",
  dark: "Ténèbres",
  steel: "Acier",
  fairy: "Fée",
};

export function getDefaultFilters(): TeamFilters {
  return {
    game: null,
    generations: [],
    types: [],
    evolutionStages: [],
  };
}

export function getIdRangesFromFilters(
  filters: TeamFilters,
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];

  let generationsToUse: number[] = [];

  if (filters.game) {
    const gameInfo = GAMES[filters.game];
    if (gameInfo) {
      generationsToUse = gameInfo.generations;
    }
  } else if (filters.generations.length > 0) {
    generationsToUse = filters.generations;
  }

  for (const gen of generationsToUse) {
    const info = GENERATIONS[gen];
    if (info) ranges.push({ start: info.start, end: info.end });
  }

  return ranges;
}

export function isInIdRanges(
  id: number,
  ranges: Array<{ start: number; end: number }>,
): boolean {
  if (ranges.length === 0) return true;
  return ranges.some((r) => id >= r.start && id <= r.end);
}
