import { fetchPokemonTeamFiltered } from "./team.js";
import { TYPE_LABELS, GAMES } from "./filters.js";
import type { TeamFilters, EvolutionStage } from "./filters.js";

function getSelectedGameValue(): string | null {
  const selectedGameInput = document.querySelector<HTMLInputElement>(
    "#gameDropdown input[name='gameFilter']:checked",
  );
  if (!selectedGameInput) return null;
  return selectedGameInput.value || null;
}

function updateCustomTriggerLabel(
  triggerEl: HTMLElement,
  dropdownEl: HTMLElement,
): void {
  const checked = Array.from(
    dropdownEl.querySelectorAll<HTMLInputElement>("input:checked"),
  );

  if (checked.length === 0) {
    triggerEl.textContent = "Select...";
    return;
  }

  const labels = checked
    .map((input) => input.parentElement?.textContent?.trim() || "")
    .filter((label) => label.length > 0);

  if (labels.length <= 2) {
    triggerEl.textContent = labels.join(", ");
    return;
  }

  triggerEl.textContent = `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

// Récupère les filtres sélectionnés depuis l'interface
function getFiltersFromUI(): TeamFilters {
  const game = getSelectedGameValue();

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
  const closeAllDropdowns = () => {
    document.querySelectorAll<HTMLElement>(".select-dropdown").forEach((dd) => {
      dd.style.display = "none";
      dd.closest(".sidenav-filter")?.classList.remove("open");
    });
  };

  const dropdowns = [
    { trigger: "gameTrigger", dropdown: "gameDropdown", singleSelect: true },
    { trigger: "genTrigger", dropdown: "genDropdown" },
    { trigger: "typeTrigger", dropdown: "typeDropdown" },
    { trigger: "evoTrigger", dropdown: "evoDropdown" },
  ];

  dropdowns.forEach(({ trigger, dropdown, singleSelect }) => {
    const triggerEl = document.getElementById(trigger);
    const dropdownEl = document.getElementById(dropdown) as HTMLElement;
    const filterContainer = triggerEl?.closest(".sidenav-filter") as
      | HTMLElement
      | null;
    if (!triggerEl || !dropdownEl) return;

    dropdownEl.style.display = "none";

    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownEl.style.display === "block";
      closeAllDropdowns();
      if (isOpen) return;

      dropdownEl.style.display = "block";
      filterContainer?.classList.add("open");
    });

    dropdownEl.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const inputs = dropdownEl.querySelectorAll<HTMLInputElement>(
      "input[type='checkbox'], input[type='radio']",
    );
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        updateCustomTriggerLabel(triggerEl, dropdownEl);

        if (singleSelect) {
          closeAllDropdowns();
        }
      });
    });

    updateCustomTriggerLabel(triggerEl, dropdownEl);
  });

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });
}

// Gère l'affichage des generations selon le jeu
function setupGameFilter(): void {
  const gameDropdown = document.getElementById("gameDropdown") as HTMLElement | null;
  if (!gameDropdown) return;

  const updateGenVisibility = () => {
    const game = getSelectedGameValue();
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

    const genTrigger = document.getElementById("genTrigger") as HTMLElement | null;
    if (genTrigger) {
      updateCustomTriggerLabel(genTrigger, genDropdown as HTMLElement);
    }
  };

  updateGenVisibility();
  gameDropdown
    .querySelectorAll<HTMLInputElement>("input[name='gameFilter']")
    .forEach((input) => {
      input.addEventListener("change", updateGenVisibility);
    });
}

// Génère et affiche une équipe de Pokémon
export async function generateTeam(): Promise<void> {
  const teamDiv = document.getElementById("team");
  if (!teamDiv) return;

  teamDiv.innerHTML = "<p>Loading your team…</p>";

  try {
    const filters = getFiltersFromUI();
    const team = await fetchPokemonTeamFiltered(6, filters);

    if (team.length === 0) {
      teamDiv.innerHTML = "<p>No Pokémon match these filters.</p>";
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
          const typeLabel = TYPE_LABELS[typeName] ? TYPE_LABELS[typeName] : typeName;
          typesHtml += `<span class="pokemon-type type-${typeName}">${typeLabel}</span>`;
        }
      }

      html += `
      <li>
        <img src="${img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="pokemon-types">${typesHtml}</div>
      </div>`;
    }
    teamDiv.innerHTML = html;
  } catch (error) {
    console.log(error);
    teamDiv.innerHTML = `<p>Error: ${error}</p>`;
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
