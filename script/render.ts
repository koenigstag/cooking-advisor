import { renderAddTab } from './tabs/create-recipe';
import { renderFridgeTab } from './tabs/fridge';
import { renderRecipesTab } from './tabs/recipes';
import { exportRecipes, importRecipesFromPayload } from './export-import';

export function render() {
  if (window.state.activeTab === 'recipes') renderRecipesTab();
  else if (window.state.activeTab === 'fridge') renderFridgeTab();
  else if (window.state.activeTab === 'add') renderAddTab();
}

window.render = render;

export function bindIOEvents() {
  const kebabBtn = document.getElementById('kebabBtn') as HTMLButtonElement;
  const dropdownMenu = document.getElementById(
    'dropdownMenu'
  ) as HTMLDivElement;
  const openIOModalBtn = document.getElementById(
    'openIOModalBtn'
  ) as HTMLButtonElement;
  const ioModalOverlay = document.getElementById(
    'ioModalOverlay'
  ) as HTMLDivElement;
  const ioModalClose = document.getElementById(
    'ioModalClose'
  ) as HTMLButtonElement;

  function closeDropdown() {
    dropdownMenu.hidden = true;
    kebabBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleDropdown() {
    const willOpen = dropdownMenu.hidden;
    dropdownMenu.hidden = !willOpen;
    kebabBtn.setAttribute('aria-expanded', String(willOpen));
  }
  kebabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
  document.addEventListener('click', (e) => {
    if (
      e.target &&
      !dropdownMenu.hidden &&
      !dropdownMenu.contains(e.target as any) &&
      e.target !== kebabBtn
    ) {
      closeDropdown();
    }
  });

  function openModal() {
    closeDropdown();
    ioModalOverlay.hidden = false;
  }
  function closeModal() {
    ioModalOverlay.hidden = true;
  }
  openIOModalBtn.addEventListener('click', openModal);
  ioModalClose.addEventListener('click', closeModal);
  ioModalOverlay.addEventListener('click', (e) => {
    if (e.target === ioModalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDropdown();
    }
  });

  document.getElementById('exportBtn')?.addEventListener('click', async () => {
    const result = await exportRecipes();
    if (!result.success) {
      alert(result.message || 'Не удалось экспортировать рецепты.');
      return;
    }

    result.click?.();
  });
  const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
  const importFile = document.getElementById('importFile') as HTMLInputElement;

  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = JSON.parse(reader.result as string);
        const result = await importRecipesFromPayload(payload);
        if (!result.success) {
          alert(result.message || 'Не удалось импортировать рецепты.');
          return;
        }
        render();
        alert(
          `Импорт завершён.\nДобавлено: ${result.added}\nОбновлено (совпало по названию): ${result.replaced}\nПропущено: ${result.skipped}`
        );
        closeModal();
      } catch (e) {
        alert(
          'Не удалось прочитать файл: он должен быть в формате JSON, экспортированном этим же приложением.'
        );
        console.error(e);
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });
}
