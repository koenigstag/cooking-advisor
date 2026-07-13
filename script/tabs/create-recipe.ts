import { t } from '../lang/index';
import { saveData } from '../database';
import { getOrCreateIngredient, ingredientName } from '../ingredient';
import { units } from '../options';
import { rerenderViewElement } from '../render';
import type { Recipe, RecipeItem } from '../state';
import { el, uid } from '../utils';

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

  const recipeFormEl = el('div', { className: 'card' }, [
    el('h3', {
      style: { marginTop: '0' },
      text: editing ? t('addRecipe.editRecipe') : t('addRecipe.addRecipe'),
    }),
    el('div', { className: 'field' }, [
      el('label', { text: t('addRecipe.fields.name.label') }),
      el('input', {
        type: 'text',
        id: 'recName',
        placeholder: t('addRecipe.fields.name.placeholder'),
        value: editing ? editing.name : draftName || '',
      }),
    ]),
    el('div', { className: 'field' }, [
      el('label', { text: t('addRecipe.fields.description.label') }),
      el('textarea', {
        id: 'recDesc',
        placeholder: t('addRecipe.fields.description.placeholder'),
        text: editing ? editing.description || '' : draftDesc || '',
      }),
    ]),
    el('label', { text: t('addRecipe.fields.ingredients.label') }),
    el('div', { id: 'ingRows' }, [
      ...window.state.draftItems.items.map((item, idx) =>
        el('div', { className: 'ing-row', 'data-idx': idx.toString() }, [
          el('div', { className: 'field' }, [
            el('input', {
              type: 'text',
              placeholder: t(
                'addRecipe.fields.ingredients.fields.name.placeholder'
              ),
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
              placeholder: t(
                'addRecipe.fields.ingredients.fields.quantity.placeholder'
              ),
              value: item.amount != null ? item.amount.toString() : '',
              'data-role': 'amount',
            }),
          ]),
          el('div', { className: 'field' }, [
            el('input', {
              type: 'text',
              placeholder: t(
                'addRecipe.fields.ingredients.fields.unit.placeholder'
              ),
              value: item.unit || '',
              'data-role': 'unit',
              list: 'unitSuggestList2',
            }),
          ]),
          el('button', {
            className: 'icon-btn',
            'data-remove': idx.toString(),
            title: t('addRecipe.fields.ingredients.actions.removeRow'),
            text: '✕',
          }),
        ])
      ),
    ]),
    el('datalist', { id: 'ingSuggestList2' }, [
      ...window.state.ingredients.map((i) => el('option', { value: i.name })),
    ]),
    el('datalist', { id: 'unitSuggestList2' }, [
      ...units.map((u) => el('option', { value: t(`units.${u}`) })),
    ]),
    el('button', { className: ['btn', 'ghost'], id: 'addRowBtn' }, [
      t('addRecipe.fields.ingredients.actions.addRow'),
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
          editing ? t('common.change') : t('addRecipe.actions.addRecipe'),
        ]),
        editing
          ? el(
              'button',
              { className: ['btn', 'secondary'], id: 'cancelEditBtn' },
              [t('common.cancel')]
            )
          : null,
      ]
    ),
    el('div', {
      className: 'section-title',
      text: t('addRecipe.recipesCount', { count: window.state.recipes.length }),
    }),
    window.state.recipes.length === 0
      ? el('div', { className: 'empty-hint', text: t('addRecipe.noRecipes') })
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
                    text: t('addRecipe.ingredientsCount', {
                      count: r.items.length,
                    }),
                  }),
                ]),
                el('div', { className: 'rlc-actions' }, [
                  el('button', { 'data-editc': r.id }, [
                    t('common.edit'),
                  ]),
                  el('button', { className: 'danger', 'data-delc': r.id }, [
                    t('common.delete'),
                  ]),
                ]),
              ])
            )
        ),
  ]);

  rerenderViewElement(recipeFormEl);
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
      alert(t('addRecipe.actions.saveAlert.noIngredients'));
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
      if (confirm(t('addRecipe.actions.confirmDelete'))) {
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
