import { useState } from "react";
import { fetchPokemonTeam } from "../lib/team";
import type { Pokemon } from "../lib/pokeapi";

export default function App() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTeam = async () => {
    setLoading(true);
    setError(null);
    setTeam([]);

    try {
      const pokemonTeam = await fetchPokemonTeam(6);
      setTeam(pokemonTeam);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Pokémon Team Generator</h1>
      <button onClick={handleGenerateTeam} disabled={loading}>
        {loading ? "Chargement..." : "Générer une équipe de 6 Pokémons"}
      </button>

      {error && <p>{error}</p>}

      {team.length > 0 && (
        <div>
          {team.map((pokemon, index) => (
            <div key={pokemon.id}>
              <h2>#{index + 1}</h2>
              <img
                src={
                  pokemon.sprites.front_default ||
                  "https://via.placeholder.com/150"
                }
                alt={pokemon.name}
              />
              <p>{pokemon.name}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
