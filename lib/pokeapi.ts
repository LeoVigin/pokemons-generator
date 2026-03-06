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
