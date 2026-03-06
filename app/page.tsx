"use client";

import { useState } from "react";
import { fetchPokemonTeam } from "../lib/team";
import type { Pokemon } from "../lib/pokeapi";
import styles from "./page.module.css";

export default function Home() {
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
    <main className={styles.main}>
      <h1>Pokémon Team Generator</h1>
      <button
        onClick={handleGenerateTeam}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "Chargement..." : "Générer une équipe de 6 Pokémons"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {team.length > 0 && (
        <div className={styles.team}>
          {team.map((pokemon, index) => (
            <div key={pokemon.id} className={styles.pokemonCard}>
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
