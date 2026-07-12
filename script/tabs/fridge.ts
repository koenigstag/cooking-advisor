import { saveData } from '../database';
import { fridgeEntry, getOrCreateIngredient } from '../ingredient';
import { el, escapeAttr, escapeHtml } from '../utils';

export function renderFridgeTab() {
  const addProductEl = el('div', { className: 'card' }, [
    el('h3', { style: { marginTop: '0' }, text: 'Мои продукты' }),
    el('div', { className: 'field-row' }, [
      el('div', { className: 'field', style: { flex: '2' } }, [
        el('label', { text: 'Название' }),
        el('input', {
          type: 'text',
          id: 'newIngName',
          placeholder: 'например, куриное филе',
          list: 'ingSuggestList',
        }),
        el('datalist', { id: 'ingSuggestList' }, [
          ...window.state.ingredients.map((i) =>
            el('option', { value: i.name })
          ),
        ]),
      ]),
      el('div', { className: 'field' }, [
        el('label', { text: 'Количество' }),
        el('input', {
          type: 'number',
          id: 'newIngAmount',
          placeholder: 'напр. 500',
          min: 0,
          step: 'any',
        }),
      ]),
      el('div', { className: 'field' }, [
        el('label', { text: 'Ед. изм.' }),
        el('input', {
          type: 'text',
          id: 'newIngUnit',
          placeholder: 'г, шт, л…',
          list: 'unitSuggestList',
        }),
        el('datalist', { id: 'unitSuggestList' }, [
          el('option', { value: 'г' }),
          el('option', { value: 'кг' }),
          el('option', { value: 'мл' }),
          el('option', { value: 'л' }),
          el('option', { value: 'шт' }),
          el('option', { value: 'ст.л.' }),
          el('option', { value: 'ч.л.' }),
          el('option', { value: 'по вкусу' }),
        ]),
      ]),
    ]),
    el('button', { className: 'btn', id: 'addIngBtn', text: 'Добавить продукт' })
  ]);

  const myProductsTitleEl = el('div', { className: 'section-title' }, [
    `Мои продукты (${window.state.ingredients.length})`,
  ]);

  window.state.viewEl.innerHTML = '';
  window.state.viewEl.append(addProductEl, myProductsTitleEl);

  if (window.state.ingredients.length === 0) {
    const noProductsEl = el('div', { className: 'empty-state' }, [
      el('div', { className: 'display', text: 'Список пуст' }),
      el('p', {
        text: 'Добавьте продукты, которые у вас есть — это позволит фильтровать рецепты.',
      }),
    ]);
    window.state.viewEl.append(noProductsEl);
  } else {
    const productsListEl = el('div', { className: 'fridge-list' }, [
      ...window.state.ingredients
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
        .map((ing) => {
          const fe = fridgeEntry(ing.id);
          return el('div', { className: 'fridge-row', 'data-row': ing.id }, [
            el('input', {
              type: 'checkbox',
              checked: fe.inStock,
              'data-stock': ing.id,
            }),
            el('span', { className: 'name', text: ing.name }),
            el('div', { className: 'qty-inputs' }, [
              el('input', {
                type: 'number',
                min: 0,
                step: 'any',
                placeholder: 'кол-во',
                value: fe.amount != null ? fe.amount : '',
                'data-amount': ing.id,
              }),
              el('input', {
                type: 'text',
                placeholder: 'ед.',
                value: fe.unit ? fe.unit : '',
                'data-unit': ing.id,
              }),
            ]),
            el('button', {
              className: 'del',
              'data-delIng': ing.id,
              text: 'Удалить',
            }),
          ]);
        }),
    ]);
    window.state.viewEl.append(productsListEl);
  }

  bindFridgeTabEvents();
}

export function bindFridgeTabEvents() {
  const addBtn = document.getElementById('addIngBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('newIngName') as HTMLInputElement;
    const amountInput = document.getElementById('newIngAmount') as HTMLInputElement;
    const unitInput = document.getElementById('newIngUnit') as HTMLInputElement;
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    const ing = getOrCreateIngredient(name);
    if (!ing) return;

    const amount =
      amountInput.value !== '' ? parseFloat(amountInput.value) : null;
    const unit = unitInput.value.trim() || null;
    window.state.fridge[ing.id] = { inStock: true, amount, unit };
    saveData();
    renderFridgeTab();
  });

  window.state.viewEl.querySelectorAll('[data-stock]').forEach((cb) => {
    const checkbox = cb as HTMLInputElement;
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.stock;
      if (!id) return;
      const fe = fridgeEntry(id);
      window.state.fridge[id] = { ...fe, inStock: checkbox.checked };
      saveData();
    });
  });
  window.state.viewEl.querySelectorAll('[data-amount]').forEach((input) => {
    const inp = input as HTMLInputElement;

    inp.addEventListener('change', () => {
      const id = inp.dataset.amount;
      if (!id) return;

      const fe = fridgeEntry(id);
      const val = inp.value !== '' ? parseFloat(inp.value) : null;
      window.state.fridge[id] = {
        ...fe,
        amount: val,
        inStock: val != null ? true : fe.inStock,
      };
      saveData();
      renderFridgeTab();
    });
  });
  window.state.viewEl.querySelectorAll('[data-unit]').forEach((input) => {
    const inp = input as HTMLInputElement;

    inp.addEventListener('change', () => {
      const id = inp.dataset.unit;
      if (!id) return;

      const fe = fridgeEntry(id);
      window.state.fridge[id] = { ...fe, unit: inp.value.trim() || null };
      saveData();
    });
  });
  window.state.viewEl.querySelectorAll('[data-delIng]').forEach((button) => {
    const btn = button as HTMLButtonElement;

    btn.addEventListener('click', () => {
      const id = btn.dataset.delIng;
      if (!id) return;

      const usedIn = window.state.recipes.filter((r) =>
        r.items.some((it) => it.ingredientId === id)
      );
      let msg = 'Удалить этот продукт из списка?';
      if (usedIn.length) {
        msg = `Этот продукт используется в ${usedIn.length} рецепт(ах). При удалении он также будет убран из них. Продолжить?`;
      }
      if (confirm(msg)) {
        window.state.ingredients = window.state.ingredients.filter((i) => i.id !== id);
        delete window.state.fridge[id];
        window.state.recipes.forEach((r) => {
          r.items = r.items.filter((it) => it.ingredientId !== id);
        });
        saveData();
        renderFridgeTab();
      }
    });
  });
}
