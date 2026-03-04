import { fetchPokemonTeam } from "./team.js";
import { TYPE_FR, GAMES } from "./filters.js";
import type { TeamFilters, EvolutionStage } from "./filters.js";

// Récupère les filtres sélectionnés depuis l'interface
function getFiltersFromUI(): TeamFilters {
  const gameSelect = document.getElementById("gameFilter") as HTMLSelectElement;
  let game = null;
  if (gameSelect) {
    game = gameSelect.value || null;
  }

  let generations: number[] = [];
  if (game && GAMES[game]) {
    // si y'a un jeu on prend ses generations
    const gameInfo = GAMES[game];
    if (gameInfo) {
      generations = gameInfo.generations;
    }
  } else {
    // sinon on prend ce qui est coché
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      "#generationFilter input:checked",
    );
    for (let i = 0; i < checkboxes.length; i++) {
      const cb = checkboxes[i];
      if (cb) {
        generations.push(parseInt(cb.value, 10));
      }
    }
  }

  const typeSelect = document.getElementById("typeFilter") as HTMLSelectElement;
  let types: string[] = [];
  if (typeSelect && typeSelect.value) {
    types = [typeSelect.value];
  }

  const evoCheckboxes = document.querySelectorAll<HTMLInputElement>(
    "#evolutionFilter input:checked",
  );
  let evolutionStages: EvolutionStage[] = [];
  for (let i = 0; i < evoCheckboxes.length; i++) {
    const cb = evoCheckboxes[i];
    if (cb) {
      evolutionStages.push(cb.value as EvolutionStage);
    }
  }

  return { game, generations, types, evolutionStages };
}

// pour gérer l'affichage des generations selon le jeu
function setupGameFilter(): void {
  const gameSelect = document.getElementById(
    "gameFilter",
  ) as HTMLSelectElement | null;
  if (!gameSelect) return;

  const updateGenVisibility = () => {
    const game = gameSelect.value;
    const genCheckboxes = document.querySelectorAll<HTMLInputElement>(
      "#generationFilter input",
    );

    for (let i = 0; i < genCheckboxes.length; i++) {
      const cb = genCheckboxes[i];
      if (!cb) continue;

      const gen = parseInt(cb.value, 10);
      let available = true;

      if (game && GAMES[game]) {
        available = GAMES[game].generations.includes(gen);
      }

      const label = cb.closest("label");
      if (label) {
        if (available) {
          label.style.display = "";
        } else {
          label.style.display = "none";
          cb.checked = false;
        }
      }
    }
  };

  updateGenVisibility();
  gameSelect.addEventListener("change", updateGenVisibility);
}

// Génère et affiche une équipe de Pokémon
export async function generateTeam(): Promise<void> {
  const teamDiv = document.getElementById("team");
  if (!teamDiv) return;

  teamDiv.innerHTML = "<p>Chargement de votre équipe…</p>";

  try {
    const filters = getFiltersFromUI();
    const team = await fetchPokemonTeam(6, filters);

    if (team.length === 0) {
      teamDiv.innerHTML = "<p>Aucun Pokémon ne correspond à ces filtres.</p>";
      return;
    }

    // afficher les pokemons
    let html = "";
    for (let i = 0; i < team.length; i++) {
      const p = team[i];
      if (!p) continue;

      const img = p.sprites.front_default || "https://via.placeholder.com/96";

      let typesHtml = "";
      for (let j = 0; j < p.types.length; j++) {
        const typeInfo = p.types[j];
        if (typeInfo) {
          const typeName = typeInfo.type.name;
          const typeFr = TYPE_FR[typeName] ? TYPE_FR[typeName] : typeName;
          typesHtml += `<span>${typeFr}</span> `;
        }
      }

      html += `
      <div>
        <img src="${img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div>${typesHtml}</div>
      </div>`;
    }
    teamDiv.innerHTML = html;
  } catch (error) {
    console.log(error);
    teamDiv.innerHTML = `<p>Erreur : ${error}</p>`;
  }
}

export function init(): void {
  const btn = document.getElementById("generateBtn");
  if (btn) {
    btn.addEventListener("click", () => generateTeam());
  }
  setupGameFilter();
}
