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
    const gameInfo = GAMES[game];
    if (gameInfo) {
      generations = gameInfo.generations;
    }
  } else {
    const genCheckboxes = document.querySelectorAll<HTMLInputElement>(
      "#genDropdown input:checked",
    );
    for (let i = 0; i < genCheckboxes.length; i++) {
      const cb = genCheckboxes[i];
      if (cb) {
        generations.push(parseInt(cb.value, 10));
      }
    }
  }

  const typeCheckboxes = document.querySelectorAll<HTMLInputElement>(
    "#typeDropdown input:checked",
  );
  let types: string[] = [];
  for (let i = 0; i < typeCheckboxes.length; i++) {
    const cb = typeCheckboxes[i];
    if (cb) {
      types.push(cb.value);
    }
  }

  const evoCheckboxes = document.querySelectorAll<HTMLInputElement>(
    "#evoDropdown input:checked",
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


function setupCustomDropdowns(): void {
  const dropdowns = [
    { trigger: "genTrigger", dropdown: "genDropdown" },
    { trigger: "typeTrigger", dropdown: "typeDropdown" },
    { trigger: "evoTrigger", dropdown: "evoDropdown" },
  ];

  dropdowns.forEach(({ trigger, dropdown }) => {
    const triggerEl = document.getElementById(trigger);
    const dropdownEl = document.getElementById(dropdown) as HTMLElement;
    if (!triggerEl || !dropdownEl) return;

    dropdownEl.style.display = "none";

    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownEl.style.display === "block";
      document.querySelectorAll(".select-dropdown").forEach((dd) => {
        (dd as HTMLElement).style.display = "none";
      });
      dropdownEl.style.display = isOpen ? "none" : "block";
    });

    dropdownEl.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const checkboxes = dropdownEl.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const checked = dropdownEl.querySelectorAll("input:checked");
        triggerEl.textContent =
          checked.length > 0
            ? `${checked.length} sélectionné(s)`
            : "Sélectionnez...";
      });
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".select-dropdown").forEach((dd) => {
      (dd as HTMLElement).style.display = "none";
    });
  });
}

// Gère l'affichage des generations selon le jeu
function setupGameFilter(): void {
  const gameSelect = document.getElementById(
    "gameFilter",
  ) as HTMLSelectElement | null;
  if (!gameSelect) return;

  const updateGenVisibility = () => {
    const game = gameSelect.value;
    const genDropdown = document.getElementById("genDropdown");
    if (!genDropdown) return;

    const labels = genDropdown.querySelectorAll("label");
    labels.forEach((label) => {
      const input = label.querySelector("input") as HTMLInputElement;
      if (!input) return;

      const gen = parseInt(input.value, 10);
      let available = true;

      if (game && GAMES[game]) {
        available = GAMES[game].generations.includes(gen);
      }

      if (available) {
        label.style.display = "";
        input.disabled = false;
      } else {
        label.style.display = "none";
        input.disabled = true;
        input.checked = false;
      }
    });
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

// Initialise l'application
export function init(): void {
  const btn = document.getElementById("generateBtn");
  if (btn) {
    btn.addEventListener("click", () => generateTeam());
  }
  setupCustomDropdowns();
  setupGameFilter();
}
