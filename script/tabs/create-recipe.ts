import { saveData } from '../database';
import { getOrCreateIngredient, ingredientName } from '../ingredient';
import { Recipe, RecipeItem } from '../state';
import { el, escapeAttr, escapeHtml, uid } from '../utils';

export function startDraftFromRecipe(recipe?: Recipe) {
  if (recipe) {
    window.state.draftItems.items = recipe.items.map((it) => ({
      ingredientId: it.ingredientId,
      name: ingredientName(it.ingredientId),
      amount: it.amount,
      unit: it.unit,
    }));
  } else {
    window.state.draftItems.items = [
      { ingredientId: null, name: '', amount: null, unit: null },
    ];
  }
}

export function renderAddTab() {
  const editing = window.state.editingRecipeId
    ? window.state.recipes.find((r) => r.id === window.state.editingRecipeId)
    : undefined;

  if (
    window.state.draftItems.items.length === 0 ||
    (editing && window.state.draftItems.forId !== editing.id) ||
    (!editing &&
      window.state.draftItems.forId !== 'new' &&
      draftItemsNeedsReset())
  ) {
    startDraftFromRecipe(editing);
    window.state.draftItems.forId = editing ? editing.id : 'new';
  }

  window.state.viewEl.innerHTML = '';

  const recipeFormEl = el('div', { className: 'card' }, [
    el('h3', {
      style: { marginTop: '0' },
      text: editing ? 'Редактировать рецепт' : 'Новый рецепт',
    }),
    el('div', { className: 'field' }, [
      el('label', { text: 'Название' }),
      el('input', {
        type: 'text',
        id: 'recName',
        placeholder: 'например, Паста Карбонара',
        value: editing ? editing.name : draftName || '',
      }),
    ]),
    el('div', { className: 'field' }, [
      el('label', { text: 'Описание / способ приготовления' }),
      el('textarea', {
        id: 'recDesc',
        placeholder: 'Короткое описание или шаги приготовления…',
        text: editing ? editing.description || '' : draftDesc || '',
      }),
    ]),
    el('label', { text: 'Ингредиенты' }),
    el('div', { id: 'ingRows' }, [
      ...window.state.draftItems.items.map((item, idx) =>
        el('div', { className: 'ing-row', 'data-idx': idx.toString() }, [
          el('div', { className: 'field' }, [
            el('input', {
              type: 'text',
              placeholder: 'продукт',
              value: item.name,
              'data-role': 'name',
              list: 'ingSuggestList2',
            }),
          ]),
          el('div', { className: 'field' }, [
            el('input', {
              type: 'number',
              min: 0,
              step: 'any',
              placeholder: 'кол-во',
              value: item.amount != null ? item.amount.toString() : '',
              'data-role': 'amount',
            }),
          ]),
          el('div', { className: 'field' }, [
            el('input', {
              type: 'text',
              placeholder: 'ед.',
              value: item.unit || '',
              'data-role': 'unit',
              list: 'unitSuggestList2',
            }),
          ]),
          el('button', {
            className: 'icon-btn',
            'data-remove': idx.toString(),
            title: 'Удалить строку',
            text: '✕',
          }),
        ])
      ),
    ]),
    el('datalist', { id: 'ingSuggestList2' }, [
      ...window.state.ingredients.map((i) => el('option', { value: i.name })),
    ]),
    el('datalist', { id: 'unitSuggestList2' }, [
      el('option', { value: 'г' }),
      el('option', { value: 'кг' }),
      el('option', { value: 'мл' }),
      el('option', { value: 'л' }),
      el('option', { value: 'шт' }),
      el('option', { value: 'ст.л.' }),
      el('option', { value: 'ч.л.' }),
      el('option', { value: 'по вкусу' }),
    ]),
    el('button', { className: ['btn', 'ghost'], id: 'addRowBtn' }, [
      '+ добавить ингредиент',
    ]),
    el(
      'div',
      {
        style: {
          marginTop: '18px',
          display: 'flex',
          gap: '10px',
        },
      },
      [
        el('button', { className: 'btn', id: 'saveRecipeBtn' }, [
          editing ? 'Сохранить изменения' : 'Добавить рецепт',
        ]),
        editing
          ? el('button', { className: ['btn', 'secondary'], id: 'cancelEditBtn' }, [
              'Отменить',
            ])
          : null,
      ]
    ),
    el('div', {
      className: 'section-title',
      text: `Все рецепты (${window.state.recipes.length})`,
    }),
    window.state.recipes.length === 0
      ? el('div', { className: 'empty-hint', text: 'Рецептов пока нет.' })
      : el(
          'div',
          { className: 'recipe-list-compact' },
          window.state.recipes
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
            .map((r) =>
              el('div', { className: 'rlc-row' }, [
                el('div', {}, [
                  el('div', { className: 'rname', text: r.name }),
                  el('div', {
                    className: 'rmeta',
                    text: `${r.items.length} ингредиент(ов)`,
                  }),
                ]),
                el('div', { className: 'rlc-actions' }, [
                  el('button', { 'data-editc': r.id }, ['Изменить']),
                  el('button', { className: 'danger', 'data-delc': r.id }, [
                    'Удалить',
                  ]),
                ]),
              ])
            )
        ),
  ]);

  window.state.viewEl.appendChild(recipeFormEl);
  bindAddTabEvents(editing);
}

let draftName = '';
let draftDesc = '';
export function draftItemsNeedsReset() {
  return false;
}

export function bindAddTabEvents(editing?: Recipe) {
  const nameInput = document.getElementById('recName') as HTMLInputElement;
  nameInput.addEventListener('input', () => {
    draftName = nameInput.value;
  });
  const descInput = document.getElementById('recDesc') as HTMLInputElement;
  descInput.addEventListener('input', () => {
    draftDesc = descInput.value;
  });

  document.getElementById('addRowBtn')?.addEventListener('click', () => {
    syncDraftFromDOM();
    window.state.draftItems.items.push({
      ingredientId: null,
      name: '',
      amount: null,
      unit: null,
    });
    renderAddTab();
  });

  window.state.viewEl.querySelectorAll('[data-remove]').forEach((button) => {
    const btn = button as HTMLButtonElement;
    btn.addEventListener('click', () => {
      syncDraftFromDOM();
      const removeIdx = btn.dataset.remove as string;
      const idx = parseInt(removeIdx);
      window.state.draftItems.items.splice(idx, 1);
      if (window.state.draftItems.items.length === 0)
        window.state.draftItems.items.push({
          ingredientId: null,
          name: '',
          amount: null,
          unit: null,
        });
      renderAddTab();
    });
  });

  document.getElementById('saveRecipeBtn')?.addEventListener('click', () => {
    syncDraftFromDOM();
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    const items: RecipeItem[] = [];
    window.state.draftItems.items.forEach((it) => {
      const n = (it.name || '').trim();
      if (!n) return;
      const ing = getOrCreateIngredient(n);
      if (!ing) return;
      items.push({
        ingredientId: ing.id,
        name: n,
        amount: it.amount,
        unit: it.unit,
      });
    });
    if (items.length === 0) {
      alert('Добавьте хотя бы один ингредиент.');
      return;
    }
    if (editing) {
      editing.name = name;
      editing.description = descInput.value.trim();
      editing.items = items;
    } else {
      window.state.recipes.push({
        id: uid(),
        name,
        description: descInput.value.trim(),
        items,
      });
    }
    saveData();
    window.state.editingRecipeId = null;
    window.state.draftName = '';
    window.state.draftDesc = '';
    window.state.draftItems.items = [
      { ingredientId: null, name: '', amount: null, unit: null },
    ];
    window.state.draftItems.forId = 'new';
    renderAddTab();
  });

  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.state.editingRecipeId = null;
      window.state.draftName = '';
      window.state.draftDesc = '';
      window.state.draftItems.items = [
        { ingredientId: null, name: '', amount: null, unit: null },
      ];
      window.state.draftItems.forId = 'new';
      renderAddTab();
    });
  }

  window.state.viewEl.querySelectorAll('[data-editc]').forEach((button) => {
    const btn = button as HTMLButtonElement;

    btn.addEventListener('click', () => {
      window.state.editingRecipeId = btn.dataset.editc;
      const r = window.state.recipes.find(
        (x) => x.id === window.state.editingRecipeId
      );
      if (!r) return;
      startDraftFromRecipe(r);
      window.state.draftItems.forId = r.id;
      renderAddTab();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  window.state.viewEl.querySelectorAll('[data-delc]').forEach((button) => {
    const btn = button as HTMLButtonElement;
    btn.addEventListener('click', () => {
      if (confirm('Удалить этот рецепт?')) {
        window.state.recipes = window.state.recipes.filter(
          (r) => r.id !== btn.dataset.delc
        );
        if (window.state.editingRecipeId === btn.dataset.delc)
          window.state.editingRecipeId = null;
        saveData();
        renderAddTab();
      }
    });
  });
}

export function syncDraftFromDOM() {
  const rows = window.state.viewEl.querySelectorAll(
    '#ingRows .ing-row'
  ) as NodeListOf<HTMLDivElement>;
  rows.forEach((row) => {
    const rowIdx = row.dataset.idx as string;
    const idx = parseInt(rowIdx);
    const nameInput = row.querySelector(
      '[data-role="name"]'
    ) as HTMLInputElement;
    const amountInput = row.querySelector(
      '[data-role="amount"]'
    ) as HTMLInputElement;
    const unitInput = row.querySelector(
      '[data-role="unit"]'
    ) as HTMLInputElement;

    const name = nameInput.value.trim();
    const amountRaw = amountInput.value.trim();
    const unit = unitInput.value.trim();

    if (window.state.draftItems.items[idx]) {
      window.state.draftItems.items[idx].name = name;
      window.state.draftItems.items[idx].amount =
        amountRaw !== '' ? parseFloat(amountRaw) : null;
      window.state.draftItems.items[idx].unit = unit?.trim() || null;
    }
  });
}
