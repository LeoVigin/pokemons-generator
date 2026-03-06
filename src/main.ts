import { fetchPokemonTeam } from "./team.js";

export async function generateTeam() {
  const teamDiv = document.getElementById("team");
  if (!teamDiv) return;
  teamDiv.innerHTML = "Chargement de votre équipe..."; //ça rajoute du style x)

  try {
    const team = await fetchPokemonTeam(6);
    teamDiv.innerHTML = team
      .map(
        (pokemon, index) => `
      <div>
        <h2>#${index + 1}</h2>
        <img src="${pokemon.sprites.front_default || "https://via.placeholder.com/150"}" alt="${pokemon.name}">
      </div>
    `,
      )
      .join("");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    teamDiv.innerHTML = `Erreur: ${errorMessage}`;
  }
}
