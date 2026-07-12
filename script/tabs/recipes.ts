import { saveData } from '../database';
import {
  evaluateRecipe,
  EvaluateRecipeResult,
  fridgeEntry,
  ingredientName,
} from '../ingredient';
import { Recipe } from '../state';
import { el, escapeHtml } from '../utils';

export function renderRecipesTab() {
  const hasIngredients = window.state.ingredients.length > 0;
  const hasRecipes = window.state.recipes.length > 0;
  const filterOpen = window.state.filterOpen;

  const viewEl = window.state.viewEl;
  if (!viewEl) {
    throw new Error('viewEl is not set');
  }

  console.debug('renderRecipesTab: filterOpen=', filterOpen, 'hasIngredients=', hasIngredients, 'hasRecipes=', hasRecipes, 'recipeSearch=', window.state.recipeSearch);

  viewEl.innerHTML = '';

  const filterPanelEl = el('div', { className: 'filter-panel' }, [
    el('div', { className: 'fp-head' }, [
      el('h3', { text: 'Что у меня есть' }),
      el('a', {
        id: 'toggleFilter',
        text: filterOpen ? 'свернуть' : 'развернуть',
      }),
      ...(filterOpen
        ? !hasIngredients
          ? [
              el('div', { className: 'empty-hint' }, [
                'Продуктов пока нет. Добавьте их во вкладке «Мои продукты» или прямо при создании рецепта.',
              ]),
            ]
          : [
              el('div', { className: 'chip-row', id: 'filterChips' }, [
                ...window.state.ingredients
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                  .map((ing) => {
                    const fe = fridgeEntry(ing.id);
                    return el(
                      'span',
                      {
                        className: `chip ${fe.inStock ? 'on' : ''}`,
                        'data-ing': ing.id,
                      },
                      [el('span', { className: 'dot' }), ing.name]
                    );
                  }),
              ]),
            ]
        : ([] as HTMLElement[])),
    ]),
    el(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          gap: '10px',
          flexWrap: 'wrap',
        },
      },
      [
        el('input', {
          type: 'text',
          id: 'recipeSearch',
          placeholder: 'Поиск по названию…',
          value: window.state.recipeSearch,
        }),
        el(
          'span',
          {
            style: {
              fontSize: '12.5px',
              color: 'var(--ink-soft)',
            },
          },
          [hasRecipes ? window.state.recipes.length + ' рец.' : '']
        ),
      ]
    ),
  ]);

  if (!hasRecipes) {
    const noRecipesEl = el('div', { className: 'empty-state' }, [
      el('div', { className: 'display' }, ['Пока нет ни одного рецепта']),
      el('p', {}, [
        'Добавьте первый рецепт во вкладке «Добавить рецепт» — и он появится здесь.',
      ]),
    ]);

    filterPanelEl.appendChild(noRecipesEl);
    window.state.viewEl.appendChild(filterPanelEl);
    bindRecipesTabEvents();
    return;
  }

  let list = window.state.recipes.map((r) => ({ r, ev: evaluateRecipe(r) }));
  if (window.state.recipeSearch.trim()) {
    const q = window.state.recipeSearch.trim().toLowerCase();
    list = list.filter((x) => x.r.name.toLowerCase().includes(q));
  }
  // sort: full match first, then by matched/total ratio desc, then name
  list.sort((a, b) => {
    const ra = a.ev.total ? a.ev.matched / a.ev.total : 0;
    const rb = b.ev.total ? b.ev.matched / b.ev.total : 0;
    if (rb !== ra) return rb - ra;
    return a.r.name.localeCompare(b.r.name, 'ru');
  });

  if (list.length === 0) {
    const noResultsEl = el('div', { className: 'empty-state' }, [
      el('div', { className: 'display' }, ['Ничего не найдено']),
    ]);
    filterPanelEl.appendChild(noResultsEl);
  } else {
    const recipeCardsEl = el('div', { className: 'recipe-grid' }, [
      ...list.map(({ r, ev }) => renderRecipeCard(r, ev)),
    ]);
    filterPanelEl.appendChild(recipeCardsEl);
  }

  console.debug('renderRecipesTab: filterOpen=', filterOpen, 'hasIngredients=', hasIngredients, 'hasRecipes=', hasRecipes, 'recipeSearch=', window.state.recipeSearch, 'list.length=', list.length);

  viewEl.appendChild(filterPanelEl);

  bindRecipesTabEvents();
}

export function renderRecipeCard(
  recipe: Recipe,
  ev: EvaluateRecipeResult
): HTMLElement {
  const pct = ev.total ? ev.matched / ev.total : 0;
  const fullMatch = ev.status === 'full';
  let statusLabelEl: HTMLElement;
  if (ev.status === 'full')
    statusLabelEl = el('span', { className: 'status-label' }, [
      'Можно готовить',
    ]);
  else if (ev.status === 'partial')
    statusLabelEl = el('span', { className: ['status-label', 'partial'] }, [
      `Не хватает ${ev.missingList.length + ev.warnList.length}`,
    ]);
  else
    statusLabelEl = el('span', { className: ['status-label', 'none'] }, [
      'Нет продуктов',
    ]);

  // readiness pips (max 8 shown, else compress)
  let pipsEls: HTMLElement[] = [];
  const maxPips = 10;
  const n = Math.min(ev.total, maxPips);
  for (let i = 0; i < n; i++) {
    const filled = i < ev.matched;
    const warn = filled && ev.warnList.length > 0 && i >= ev.matched - 0; // simple fill, no per-item warn distinction here
    pipsEls.push(
      el('span', { className: ['pip', filled ? 'filled' : undefined] })
    );
  }

  let ingredientsEl = el('div', { className: 'rc-ingredients' });
  recipe.items.forEach((item) => {
    const fe = fridgeEntry(item.ingredientId);
    const isMissing = !fe.inStock;
    const isWarn = ev.warnList.some(
      (w) => w.ingredientId === item.ingredientId
    );
    const qtyEl =
      item.amount != null
        ? el('small', {}, [
            `${item.amount}${item.unit ? ' ' + escapeHtml(item.unit) : ''}`,
          ])
        : null;
    ingredientsEl.appendChild(
      el(
        'span',
        { className: ['chip', 'readonly', isMissing ? 'missing' : 'on'] },
        [
          el('span', { className: 'dot' }),
          escapeHtml(ingredientName(item.ingredientId)),
          qtyEl ? el('small', {}, [qtyEl]) : null,
          isWarn ? el('small', {}, ['(мало)']) : null,
        ]
      )
    );
  });

  const recipeCardEl = el(
    'div',
    { className: ['recipe-card', fullMatch ? 'full-match' : ''].join(' ') },
    [
      el('div', { className: 'rc-head' }, [
        el('h3', {}, [escapeHtml(recipe.name)]),
        el('div', { className: 'readiness' }, pipsEls),
      ]),
      recipe.description
        ? el('p', { className: 'rc-desc' }, [escapeHtml(recipe.description)])
        : null,
      ingredientsEl,
      el('div', { className: 'rc-footer' }, [
        statusLabelEl,
        el('div', { style: { marginTop: '5px' } }, [
          ` · ${ev.matched}/${ev.total} есть в наличии`,
        ]),
      ]),
      el('div', { className: 'rc-actions' }, [
        el('button', { 'data-edit': recipe.id }, ['Редактировать']),
        el('button', { 'data-del': recipe.id }, ['Удалить']),
      ]),
    ]
  );

  return recipeCardEl;
}

export function bindRecipesTabEvents() {
  const t = document.getElementById('toggleFilter');
  if (t)
    t.addEventListener('click', () => {
      window.state.filterOpen = !window.state.filterOpen;
      renderRecipesTab();
    });

  const chips = document.getElementById('filterChips');
  if (chips) {
    chips.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const id = (chip as HTMLElement).dataset.ing;

        if (!id) return;

        const fe = fridgeEntry(id);
        window.state.fridge[id] = {
          inStock: !fe.inStock,
          amount: fe.amount,
          unit: fe.unit,
        };
        saveData();
        renderRecipesTab();
      });
    });
  }

  const search = document.getElementById('recipeSearch') as HTMLInputElement;
  if (search) {
    search.addEventListener('input', () => {
      window.state.recipeSearch = search.value;
      renderRecipesTab();
      // restore focus & caret after re-render
      const s2 = document.getElementById('recipeSearch') as HTMLInputElement;
      if (s2) {
        s2.focus();
        s2.setSelectionRange(s2.value.length, s2.value.length);
      }
    });
  }

  window.state.viewEl.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.state.editingRecipeId = (btn as HTMLElement).dataset.edit;
      window.state.activeTab = 'add';
      document
        .querySelectorAll('nav.tabs button')
        .forEach((b) =>
          b.classList.toggle('active', (b as HTMLElement).dataset.tab === 'add')
        );
      window.render();
    });
  });
  window.state.viewEl.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm('Удалить этот рецепт?')) {
        window.state.recipes = window.state.recipes.filter(
          (r) => r.id !== (btn as HTMLElement).dataset.del
        );
        saveData();
        renderRecipesTab();
      }
    });
  });
}
