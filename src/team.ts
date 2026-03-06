import { fetchPokemon } from "./pokeapi";
import type { Pokemon } from "./pokeapi";
import {
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchPokemonNamesByType,
  getEvolutionStage,
} from "./pokeapi.js";
import {
  getIdRangesFromFilters,
  isInIdRanges,
  getDefaultFilters,
} from "./filters.js";
import type { TeamFilters } from "./filters.js";

interface PokemonEntry {
  name: string;
  url: string;
  id: number;
}

function idFromUrl(url: string): number {
  const parts = url.replace(/\/+$/, "").split("/");
  return parseInt(parts[parts.length - 1]!, 10);
}

export async function fetchPokemonTeam(count = 6): Promise<Pokemon[]> {
  let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await response.json();

  let allPokemon = data.results;
  let randomPokemon = allPokemon
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  const team = await Promise.all(
    randomPokemon.map((p: { name: string }) => fetchPokemon(p.name)),
  );

  return team;
}

export async function fetchPokemonTeamFiltered(
  count = 6,
  filters: TeamFilters = getDefaultFilters(),
): Promise<Pokemon[]> {
  // Récupére la liste complète
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await response.json();
  let pool: PokemonEntry[] = (
    data.results as Array<{ name: string; url: string }>
  ).map((p) => ({ ...p, id: idFromUrl(p.url) }));

  // Filtre par région / génération
  const idRanges = getIdRangesFromFilters(filters);
  if (idRanges.length > 0) {
    pool = pool.filter((p) => isInIdRanges(p.id, idRanges));
  }

  // Filtre par type
  if (filters.types.length > 0) {
    const setsOfNames = await Promise.all(
      filters.types.map((t) => fetchPokemonNamesByType(t)),
    );
    const allowedNames = new Set<string>();
    for (const s of setsOfNames) {
      for (const n of s) allowedNames.add(n);
    }
    pool = pool.filter((p) => allowedNames.has(p.name));
  }

  pool.sort(() => Math.random() - 0.5);

  // Filtre par stade d'évolution
  if (filters.evolutionStages.length > 0) {
    const matched: PokemonEntry[] = [];
    const BATCH = 15;

    for (let i = 0; i < pool.length && matched.length < count; i += BATCH) {
      const batch = pool.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(async (entry) => {
          try {
            const species = await fetchPokemonSpecies(entry.id);
            const chain = await fetchEvolutionChain(
              species.evolution_chain.url,
            );
            const stages = getEvolutionStage(entry.name, chain.chain);
            const match = stages.some((s) =>
              filters.evolutionStages.includes(s),
            );
            return { entry, match };
          } catch {
            return { entry, match: false };
          }
        }),
      );
      for (const r of results) {
        if (r.match && matched.length < count) matched.push(r.entry);
      }
    }
    pool = matched;
  }

  const selected = pool.slice(0, count);
  if (selected.length === 0) return [];

  const team = await Promise.all(selected.map((p) => fetchPokemon(p.name)));
  return team;
}
