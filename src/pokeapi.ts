export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  forms: Array<{ name: string; url: string }>;
  sprites: { [key: string]: string | null };
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: { name: string; url: string };
  }>;
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: { url: string };
  evolves_from_species: { name: string; url: string } | null;
}

export interface EvolutionChainLink {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainData {
  chain: EvolutionChainLink;
}

// Cache pour éviter les appels API redondants
const speciesCache = new Map<string | number, PokemonSpecies>();
const chainCache = new Map<string, EvolutionChainData>();

// Récupère les données d'un Pokémon
export async function fetchPokemon(
  nameOrId: string | number,
): Promise<Pokemon> {
  const url = `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon: ${response.status}`);
  }
  return response.json();
}

export async function fetchPokemonSpecies(
  nameOrId: string | number,
): Promise<PokemonSpecies> {
  const cached = speciesCache.get(nameOrId);
  if (cached) return cached;
  const url = `https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch species: ${response.status}`);
  const data: PokemonSpecies = await response.json();
  speciesCache.set(nameOrId, data);
  speciesCache.set(data.name, data);
  speciesCache.set(data.id, data);
  return data;
}

export async function fetchEvolutionChain(
  url: string,
): Promise<EvolutionChainData> {
  const cached = chainCache.get(url);
  if (cached) return cached;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch evolution chain: ${response.status}`);
  const data: EvolutionChainData = await response.json();
  chainCache.set(url, data);
  return data;
}

/** Renvoie la liste des noms de Pokémon d'un type donné */
export async function fetchPokemonNamesByType(
  type: string,
): Promise<Set<string>> {
  const url = `https://pokeapi.co/api/v2/type/${type}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch type: ${response.status}`);
  const data = await response.json();
  const names = new Set<string>();
  for (const entry of data.pokemon as Array<{
    pokemon: { name: string };
  }>) {
    names.add(entry.pokemon.name);
  }
  return names;
}

export function getEvolutionStage(
  pokemonName: string,
  chain: EvolutionChainLink,
): Array<"base" | "middle" | "final"> {
  if (chain.species.name === pokemonName && chain.evolves_to.length === 0) {
    return ["base", "final"];
  }

  if (chain.species.name === pokemonName) {
    return ["base"];
  }

  for (const evo of chain.evolves_to) {
    if (evo.species.name === pokemonName) {
      return evo.evolves_to.length === 0 ? ["final"] : ["middle"];
    }
    for (const evo2 of evo.evolves_to) {
      if (evo2.species.name === pokemonName) {
        return ["final"];
      }
    }
  }

  return ["base"];
}
