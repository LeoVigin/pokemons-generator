import { fetchPokemon } from "./pokeapi.js";
import type { Pokemon } from "./pokeapi.js";

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
